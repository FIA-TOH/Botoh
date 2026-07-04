import { Pool } from "pg";

export interface PublicCircuitRecord {
  track_name: string;
  base_record_time: number | null;
  base_record_driver: string | null;
  record_lap_time: number | null;
  record_lap_driver: string | null;
  sector1_record_time: number | null;
  sector1_record_driver: string | null;
  sector2_record_time: number | null;
  sector2_record_driver: string | null;
  sector3_record_time: number | null;
  sector3_record_driver: string | null;
  rr_position_x: number | null;
  rr_position_y: number | null;
  played_count: number;
  vote_count: number;
}

export interface PublicDriverCircuitStats {
  auth: string;
  track_name: string;
  name: string;
  races_count: number;
  best_position: number | null;
  position_sum: number;
  position_count: number;
  best_lap_time: number | null;
  best_sector1_time: number | null;
  best_sector2_time: number | null;
  best_sector3_time: number | null;
}

type SectorIndex = 1 | 2 | 3;

let pool: Pool | null = null;
let schemaReady = false;
const circuitCache = new Map<string, PublicCircuitRecord>();

function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw Object.assign(new Error("DATABASE_URL is not configured"), {
        code: "DATABASE_UNAVAILABLE",
      });
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 4,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return pool;
}

async function ensureSchema() {
  if (schemaReady) return;

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_users (
      auth VARCHAR(255) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMP NULL
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_circuits (
      track_name VARCHAR(150) PRIMARY KEY,
      base_record_time NUMERIC(10, 3) NULL,
      base_record_driver VARCHAR(100) NULL,
      record_lap_time NUMERIC(10, 3) NULL,
      record_lap_driver VARCHAR(100) NULL,
      sector1_record_time NUMERIC(10, 3) NULL,
      sector1_record_driver VARCHAR(100) NULL,
      sector2_record_time NUMERIC(10, 3) NULL,
      sector2_record_driver VARCHAR(100) NULL,
      sector3_record_time NUMERIC(10, 3) NULL,
      sector3_record_driver VARCHAR(100) NULL,
      rr_position_x NUMERIC(10, 3) NULL,
      rr_position_y NUMERIC(10, 3) NULL,
      played_count INTEGER NOT NULL DEFAULT 0,
      vote_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await getPool().query("ALTER TABLE public_circuits ADD COLUMN IF NOT EXISTS rr_position_x NUMERIC(10, 3) NULL");
  await getPool().query("ALTER TABLE public_circuits ADD COLUMN IF NOT EXISTS rr_position_y NUMERIC(10, 3) NULL");

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_driver_circuit_stats (
      auth VARCHAR(255) NOT NULL REFERENCES public_users(auth) ON DELETE CASCADE,
      track_name VARCHAR(150) NOT NULL REFERENCES public_circuits(track_name) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      races_count INTEGER NOT NULL DEFAULT 0,
      best_position INTEGER NULL,
      position_sum INTEGER NOT NULL DEFAULT 0,
      position_count INTEGER NOT NULL DEFAULT 0,
      best_lap_time NUMERIC(10, 3) NULL,
      best_sector1_time NUMERIC(10, 3) NULL,
      best_sector2_time NUMERIC(10, 3) NULL,
      best_sector3_time NUMERIC(10, 3) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (auth, track_name)
    )
  `);

  await getPool().query("CREATE INDEX IF NOT EXISTS public_circuits_played_idx ON public_circuits(played_count DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_circuits_votes_idx ON public_circuits(vote_count DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_driver_circuit_stats_track_idx ON public_driver_circuit_stats(track_name)");

  schemaReady = true;
}

function normalizeCircuit(row: any): PublicCircuitRecord {
  return {
    ...row,
    base_record_time: row.base_record_time === null ? null : Number(row.base_record_time),
    record_lap_time: row.record_lap_time === null ? null : Number(row.record_lap_time),
    sector1_record_time: row.sector1_record_time === null ? null : Number(row.sector1_record_time),
    sector2_record_time: row.sector2_record_time === null ? null : Number(row.sector2_record_time),
    sector3_record_time: row.sector3_record_time === null ? null : Number(row.sector3_record_time),
    rr_position_x: row.rr_position_x === null ? null : Number(row.rr_position_x),
    rr_position_y: row.rr_position_y === null ? null : Number(row.rr_position_y),
  };
}

function cacheCircuit(record: PublicCircuitRecord) {
  circuitCache.set(record.track_name, record);
  return record;
}

function normalizeDriverCircuitStats(row: any): PublicDriverCircuitStats {
  return {
    ...row,
    best_position: row.best_position === null ? null : Number(row.best_position),
    position_sum: Number(row.position_sum),
    position_count: Number(row.position_count),
    races_count: Number(row.races_count),
    best_lap_time: row.best_lap_time === null ? null : Number(row.best_lap_time),
    best_sector1_time: row.best_sector1_time === null ? null : Number(row.best_sector1_time),
    best_sector2_time: row.best_sector2_time === null ? null : Number(row.best_sector2_time),
    best_sector3_time: row.best_sector3_time === null ? null : Number(row.best_sector3_time),
  };
}

export function getCachedPublicCircuit(trackName: string) {
  return circuitCache.get(trackName) ?? null;
}

export function getCachedPublicCircuitLapRecord(trackName: string) {
  const circuit = getCachedPublicCircuit(trackName);
  return circuit?.record_lap_time ?? circuit?.base_record_time ?? null;
}

export async function upsertPublicCircuit(input: {
  trackName: string;
  baseRecordTime: number | null;
  baseRecordDriver: string | null;
  incrementPlayed?: boolean;
}) {
  await ensureSchema();

  const result = await getPool().query(
    `INSERT INTO public_circuits
      (track_name, base_record_time, base_record_driver, record_lap_time, record_lap_driver, played_count)
     VALUES ($1, $2, $3, $2, $3, $4)
     ON CONFLICT (track_name)
     DO UPDATE SET
       base_record_time = COALESCE(EXCLUDED.base_record_time, public_circuits.base_record_time),
       base_record_driver = COALESCE(EXCLUDED.base_record_driver, public_circuits.base_record_driver),
       record_lap_time = CASE
         WHEN public_circuits.record_lap_time IS NULL THEN EXCLUDED.record_lap_time
         WHEN public_circuits.record_lap_time = public_circuits.base_record_time
           AND EXCLUDED.base_record_time IS NOT NULL THEN EXCLUDED.record_lap_time
         ELSE public_circuits.record_lap_time
       END,
       record_lap_driver = CASE
         WHEN public_circuits.record_lap_time IS NULL THEN EXCLUDED.record_lap_driver
         WHEN public_circuits.record_lap_time = public_circuits.base_record_time
           AND EXCLUDED.base_record_driver IS NOT NULL THEN EXCLUDED.record_lap_driver
         ELSE public_circuits.record_lap_driver
       END,
       played_count = public_circuits.played_count + $4,
       updated_at = NOW()
     RETURNING *`,
    [
      input.trackName,
      input.baseRecordTime,
      input.baseRecordDriver,
      input.incrementPlayed ? 1 : 0,
    ],
  );

  return cacheCircuit(normalizeCircuit(result.rows[0]));
}

export async function getPublicCircuit(trackName: string) {
  await ensureSchema();
  const result = await getPool().query("SELECT * FROM public_circuits WHERE track_name = $1", [trackName]);
  const circuit = result.rows[0] ? normalizeCircuit(result.rows[0]) : null;
  if (circuit) cacheCircuit(circuit);
  return circuit;
}

export async function getPublicDriverCircuitStats(auth: string, trackName: string) {
  await ensureSchema();
  const result = await getPool().query(
    `SELECT auth, track_name, name, races_count, best_position, position_sum,
       position_count, best_lap_time, best_sector1_time, best_sector2_time,
       best_sector3_time
     FROM public_driver_circuit_stats
     WHERE auth = $1 AND track_name = $2`,
    [auth, trackName],
  );

  return result.rows[0] ? normalizeDriverCircuitStats(result.rows[0]) : null;
}

export async function incrementPublicCircuitVote(trackName: string) {
  await ensureSchema();
  const result = await getPool().query(
    `UPDATE public_circuits
     SET vote_count = vote_count + 1, updated_at = NOW()
     WHERE track_name = $1
     RETURNING *`,
    [trackName],
  );
  if (result.rows[0]) cacheCircuit(normalizeCircuit(result.rows[0]));
}

export async function updatePublicCircuitRRPosition(input: {
  trackName: string;
  x: number;
  y: number;
}) {
  await ensureSchema();
  const result = await getPool().query(
    `INSERT INTO public_circuits (track_name, rr_position_x, rr_position_y)
     VALUES ($1, $2, $3)
     ON CONFLICT (track_name)
     DO UPDATE SET
       rr_position_x = EXCLUDED.rr_position_x,
       rr_position_y = EXCLUDED.rr_position_y,
       updated_at = NOW()
     RETURNING *`,
    [input.trackName, input.x, input.y],
  );

  return cacheCircuit(normalizeCircuit(result.rows[0]));
}

export async function recordPublicLapAttempt(input: {
  auth: string;
  playerName: string;
  trackName: string;
  lapTime: number;
  sectorTimes: [number | null, number | null, number | null];
}) {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO public_driver_circuit_stats
        (auth, track_name, name, best_lap_time, best_sector1_time, best_sector2_time, best_sector3_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (auth, track_name)
       DO UPDATE SET
         name = EXCLUDED.name,
         best_lap_time = CASE
           WHEN public_driver_circuit_stats.best_lap_time IS NULL THEN EXCLUDED.best_lap_time
           ELSE LEAST(public_driver_circuit_stats.best_lap_time, EXCLUDED.best_lap_time)
         END,
         best_sector1_time = CASE
           WHEN EXCLUDED.best_sector1_time IS NULL THEN public_driver_circuit_stats.best_sector1_time
           WHEN public_driver_circuit_stats.best_sector1_time IS NULL THEN EXCLUDED.best_sector1_time
           ELSE LEAST(public_driver_circuit_stats.best_sector1_time, EXCLUDED.best_sector1_time)
         END,
         best_sector2_time = CASE
           WHEN EXCLUDED.best_sector2_time IS NULL THEN public_driver_circuit_stats.best_sector2_time
           WHEN public_driver_circuit_stats.best_sector2_time IS NULL THEN EXCLUDED.best_sector2_time
           ELSE LEAST(public_driver_circuit_stats.best_sector2_time, EXCLUDED.best_sector2_time)
         END,
         best_sector3_time = CASE
           WHEN EXCLUDED.best_sector3_time IS NULL THEN public_driver_circuit_stats.best_sector3_time
           WHEN public_driver_circuit_stats.best_sector3_time IS NULL THEN EXCLUDED.best_sector3_time
           ELSE LEAST(public_driver_circuit_stats.best_sector3_time, EXCLUDED.best_sector3_time)
         END,
         updated_at = NOW()`,
      [
        input.auth,
        input.trackName,
        input.playerName,
        input.lapTime,
        input.sectorTimes[0],
        input.sectorTimes[1],
        input.sectorTimes[2],
      ],
    );

    const circuitResult = await client.query(
      `UPDATE public_circuits
       SET
         record_lap_time = CASE
           WHEN record_lap_time IS NULL OR $2 < record_lap_time THEN $2
           ELSE record_lap_time
         END,
         record_lap_driver = CASE
           WHEN record_lap_time IS NULL OR $2 < record_lap_time THEN $3
           ELSE record_lap_driver
         END,
         updated_at = NOW()
       WHERE track_name = $1
       RETURNING *`,
      [input.trackName, input.lapTime, input.playerName],
    );

    await client.query("COMMIT");
    if (circuitResult.rows[0]) cacheCircuit(normalizeCircuit(circuitResult.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPublicSectorAttempt(input: {
  auth: string;
  playerName: string;
  trackName: string;
  sectorIndex: SectorIndex;
  sectorTime: number;
}) {
  await ensureSchema();
  const sectorColumn = `sector${input.sectorIndex}_record_time`;
  const sectorDriverColumn = `sector${input.sectorIndex}_record_driver`;
  const personalColumn = `best_sector${input.sectorIndex}_time`;
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO public_driver_circuit_stats
        (auth, track_name, name, ${personalColumn})
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth, track_name)
       DO UPDATE SET
         name = EXCLUDED.name,
         ${personalColumn} = CASE
           WHEN public_driver_circuit_stats.${personalColumn} IS NULL THEN EXCLUDED.${personalColumn}
           ELSE LEAST(public_driver_circuit_stats.${personalColumn}, EXCLUDED.${personalColumn})
         END,
         updated_at = NOW()`,
      [input.auth, input.trackName, input.playerName, input.sectorTime],
    );
    const result = await client.query(
      `UPDATE public_circuits
       SET
         ${sectorColumn} = CASE
           WHEN ${sectorColumn} IS NULL OR $2 < ${sectorColumn} THEN $2
           ELSE ${sectorColumn}
         END,
         ${sectorDriverColumn} = CASE
           WHEN ${sectorColumn} IS NULL OR $2 < ${sectorColumn} THEN $3
           ELSE ${sectorDriverColumn}
         END,
         updated_at = NOW()
       WHERE track_name = $1
       RETURNING *`,
      [input.trackName, input.sectorTime, input.playerName],
    );

    await client.query("COMMIT");
    if (result.rows[0]) cacheCircuit(normalizeCircuit(result.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPublicCircuitRaceResult(input: {
  auth: string;
  playerName: string;
  trackName: string;
  position: number;
}) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO public_driver_circuit_stats
      (auth, track_name, name, races_count, best_position, position_sum, position_count)
     VALUES ($1, $2, $3, 1, $4, $4, 1)
     ON CONFLICT (auth, track_name)
     DO UPDATE SET
       name = EXCLUDED.name,
       races_count = public_driver_circuit_stats.races_count + 1,
       best_position = CASE
         WHEN public_driver_circuit_stats.best_position IS NULL THEN EXCLUDED.best_position
         ELSE LEAST(public_driver_circuit_stats.best_position, EXCLUDED.best_position)
       END,
       position_sum = public_driver_circuit_stats.position_sum + EXCLUDED.position_sum,
       position_count = public_driver_circuit_stats.position_count + 1,
       updated_at = NOW()`,
    [input.auth, input.trackName, input.playerName, input.position],
  );
}
