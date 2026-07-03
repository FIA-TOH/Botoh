import { Pool } from "pg";

export interface PublicCompetitionProfile {
  auth: string;
  name: string;
  ranking_xp: number;
  championship_points: number;
  placement_races_remaining: number;
  placement_performance_sum: number;
  placement_performance_count: number;
  placement_ranking_applied: boolean;
  races_count: number;
  qualy_count: number;
  created_at: string;
  updated_at: string;
}

export interface PublicChampionshipStanding {
  auth: string;
  position: number;
  championship_points: number;
  points_behind_next: number | null;
}

let pool: Pool | null = null;
let schemaReady = false;

function normalizePublicCompetitionProfile(row: PublicCompetitionProfile) {
  return {
    ...row,
    ranking_xp: Number(row.ranking_xp),
    championship_points: Number(row.championship_points),
    placement_races_remaining: Number(row.placement_races_remaining),
    placement_performance_sum: Number(row.placement_performance_sum),
    placement_performance_count: Number(row.placement_performance_count),
    placement_ranking_applied: Boolean(row.placement_ranking_applied),
    races_count: Number(row.races_count),
    qualy_count: Number(row.qualy_count),
  };
}

function calculatePlacementInitialXp(averagePerformancePercent: number) {
  if (averagePerformancePercent <= 0.25) return 2800;
  if (averagePerformancePercent <= 0.5) return 2400;
  if (averagePerformancePercent <= 0.75) return 2000;
  if (averagePerformancePercent <= 1) return 1650;
  if (averagePerformancePercent <= 1.5) return 1200;
  if (averagePerformancePercent <= 2) return 900;
  if (averagePerformancePercent <= 3) return 550;
  if (averagePerformancePercent <= 4) return 300;
  return 100;
}

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
    CREATE TABLE IF NOT EXISTS public_driver_profiles (
      auth VARCHAR(255) PRIMARY KEY REFERENCES public_users(auth) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      ranking_xp INTEGER NOT NULL DEFAULT 0,
      championship_points INTEGER NOT NULL DEFAULT 0,
      placement_races_remaining INTEGER NOT NULL DEFAULT 5,
      placement_performance_sum NUMERIC(10, 6) NOT NULL DEFAULT 0,
      placement_performance_count INTEGER NOT NULL DEFAULT 0,
      placement_ranking_applied BOOLEAN NOT NULL DEFAULT FALSE,
      races_count INTEGER NOT NULL DEFAULT 0,
      qualy_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await getPool().query("ALTER TABLE public_driver_profiles ADD COLUMN IF NOT EXISTS placement_performance_sum NUMERIC(10, 6) NOT NULL DEFAULT 0");
  await getPool().query("ALTER TABLE public_driver_profiles ADD COLUMN IF NOT EXISTS placement_performance_count INTEGER NOT NULL DEFAULT 0");
  await getPool().query("ALTER TABLE public_driver_profiles ADD COLUMN IF NOT EXISTS placement_ranking_applied BOOLEAN NOT NULL DEFAULT FALSE");

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_ranking_events (
      id BIGSERIAL PRIMARY KEY,
      auth VARCHAR(255) NOT NULL REFERENCES public_users(auth) ON DELETE CASCADE,
      player_name VARCHAR(100) NOT NULL,
      track_name VARCHAR(150) NOT NULL,
      lap_time NUMERIC(10, 3) NOT NULL,
      track_record NUMERIC(10, 3) NOT NULL,
      xp_delta INTEGER NOT NULL,
      xp_after INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_championship_events (
      id BIGSERIAL PRIMARY KEY,
      auth VARCHAR(255) NOT NULL REFERENCES public_users(auth) ON DELETE CASCADE,
      player_name VARCHAR(100) NOT NULL,
      track_name VARCHAR(150) NOT NULL,
      position INTEGER NOT NULL,
      players_count INTEGER NOT NULL,
      average_ranking_xp NUMERIC(10, 2) NOT NULL,
      points_delta INTEGER NOT NULL,
      points_after INTEGER NOT NULL,
      ranking_xp_at_race INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS public_placement_events (
      id BIGSERIAL PRIMARY KEY,
      auth VARCHAR(255) NOT NULL REFERENCES public_users(auth) ON DELETE CASCADE,
      player_name VARCHAR(100) NOT NULL,
      track_name VARCHAR(150) NOT NULL,
      lap_time NUMERIC(10, 3) NOT NULL,
      track_record NUMERIC(10, 3) NOT NULL,
      performance_percent NUMERIC(10, 6) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await getPool().query("CREATE INDEX IF NOT EXISTS public_driver_profiles_points_idx ON public_driver_profiles(championship_points DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_driver_profiles_ranking_idx ON public_driver_profiles(ranking_xp DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_ranking_events_auth_idx ON public_ranking_events(auth, created_at DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_championship_events_auth_idx ON public_championship_events(auth, created_at DESC)");
  await getPool().query("CREATE INDEX IF NOT EXISTS public_placement_events_auth_idx ON public_placement_events(auth, performance_percent ASC)");

  schemaReady = true;
}

export async function ensurePublicCompetitionProfile(
  auth: string,
  name: string,
  placementRaces = 5,
) {
  await ensureSchema();

  const result = await getPool().query<PublicCompetitionProfile>(
    `INSERT INTO public_driver_profiles (auth, name, placement_races_remaining)
     VALUES ($1, $2, $3)
     ON CONFLICT (auth)
     DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING auth, name, ranking_xp, championship_points, placement_races_remaining,
       placement_performance_sum, placement_performance_count, placement_ranking_applied,
       races_count, qualy_count, created_at, updated_at`,
    [auth, name, placementRaces],
  );

  return normalizePublicCompetitionProfile(result.rows[0]);
}

export async function getPublicCompetitionProfiles(auths: string[]) {
  await ensureSchema();
  if (auths.length === 0) return [];

  const result = await getPool().query<PublicCompetitionProfile>(
    `SELECT auth, name, ranking_xp, championship_points, placement_races_remaining,
       placement_performance_sum, placement_performance_count, placement_ranking_applied,
       races_count, qualy_count, created_at, updated_at
     FROM public_driver_profiles
     WHERE auth = ANY($1::varchar[])`,
    [auths],
  );

  return result.rows.map(normalizePublicCompetitionProfile);
}

export async function getPublicCompetitionProfile(auth: string) {
  const profiles = await getPublicCompetitionProfiles([auth]);
  return profiles[0] ?? null;
}

export async function recordPublicPlacementPerformance(input: {
  auth: string;
  playerName: string;
  trackName: string;
  lapTime: number;
  trackRecord: number;
  performancePercent: number;
}) {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const profileResult = await client.query<PublicCompetitionProfile>(
      `UPDATE public_driver_profiles
       SET placement_performance_sum = placement_performance_sum + $2,
           placement_performance_count = placement_performance_count + 1,
           qualy_count = qualy_count + 1,
           name = $3,
           updated_at = NOW()
       WHERE auth = $1
       RETURNING auth, name, ranking_xp, championship_points, placement_races_remaining,
         placement_performance_sum, placement_performance_count, placement_ranking_applied,
         races_count, qualy_count, created_at, updated_at`,
      [input.auth, input.performancePercent, input.playerName],
    );

    const profile = profileResult.rows[0];
    await client.query(
      `INSERT INTO public_placement_events
       (auth, player_name, track_name, lap_time, track_record, performance_percent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.auth,
        input.playerName,
        input.trackName,
        input.lapTime,
        input.trackRecord,
        input.performancePercent,
      ],
    );

    await client.query(
      `INSERT INTO public_ranking_events
       (auth, player_name, track_name, lap_time, track_record, xp_delta, xp_after)
       VALUES ($1, $2, $3, $4, $5, 0, $6)`,
      [
        input.auth,
        input.playerName,
        input.trackName,
        input.lapTime,
        input.trackRecord,
        profile.ranking_xp,
      ],
    );

    await client.query("COMMIT");
    return normalizePublicCompetitionProfile(profile);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPublicRankingXp(input: {
  auth: string;
  playerName: string;
  trackName: string;
  lapTime: number;
  trackRecord: number;
  xpDelta: number;
}) {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const profileResult = await client.query<PublicCompetitionProfile>(
      `UPDATE public_driver_profiles
       SET ranking_xp = GREATEST(0, ranking_xp + $2),
           qualy_count = qualy_count + 1,
           name = $3,
           updated_at = NOW()
       WHERE auth = $1
       RETURNING auth, name, ranking_xp, championship_points, placement_races_remaining,
         placement_performance_sum, placement_performance_count, placement_ranking_applied,
         races_count, qualy_count, created_at, updated_at`,
      [input.auth, input.xpDelta, input.playerName],
    );

    const profile = profileResult.rows[0];
    await client.query(
      `INSERT INTO public_ranking_events
       (auth, player_name, track_name, lap_time, track_record, xp_delta, xp_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.auth,
        input.playerName,
        input.trackName,
        input.lapTime,
        input.trackRecord,
        input.xpDelta,
        profile.ranking_xp,
      ],
    );

    await client.query("COMMIT");
    return normalizePublicCompetitionProfile(profile);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPublicChampionshipPoints(input: {
  auth: string;
  playerName: string;
  trackName: string;
  position: number;
  playersCount: number;
  averageRankingXp: number;
  pointsDelta: number;
}) {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const profileResult = await client.query<PublicCompetitionProfile>(
      `UPDATE public_driver_profiles
       SET championship_points = championship_points + $2,
           placement_races_remaining = GREATEST(0, placement_races_remaining - 1),
           races_count = races_count + 1,
           name = $3,
           updated_at = NOW()
       WHERE auth = $1
       RETURNING auth, name, ranking_xp, championship_points, placement_races_remaining,
         placement_performance_sum, placement_performance_count, placement_ranking_applied,
         races_count, qualy_count, created_at, updated_at`,
      [input.auth, input.pointsDelta, input.playerName],
    );

    let profile = profileResult.rows[0];
    const shouldApplyPlacementRanking =
      profile.placement_races_remaining === 0 &&
      !profile.placement_ranking_applied &&
      profile.placement_performance_count > 0;

    if (shouldApplyPlacementRanking) {
      const placementResult = await client.query<{ average_performance: string | number | null }>(
        `SELECT AVG(performance_percent) AS average_performance
         FROM (
           SELECT performance_percent
           FROM public_placement_events
           WHERE auth = $1
           ORDER BY performance_percent ASC, created_at ASC
           LIMIT 5
         ) best_placements`,
        [input.auth],
      );
      const averagePerformance = Number(
        placementResult.rows[0]?.average_performance
          ?? profile.placement_performance_sum / profile.placement_performance_count,
      );
      const initialXp = calculatePlacementInitialXp(averagePerformance);
      const placementProfileResult = await client.query<PublicCompetitionProfile>(
        `UPDATE public_driver_profiles
         SET ranking_xp = $2,
             placement_ranking_applied = TRUE,
             updated_at = NOW()
         WHERE auth = $1
         RETURNING auth, name, ranking_xp, championship_points, placement_races_remaining,
           placement_performance_sum, placement_performance_count, placement_ranking_applied,
           races_count, qualy_count, created_at, updated_at`,
        [input.auth, initialXp],
      );
      profile = placementProfileResult.rows[0];
    }

    await client.query(
      `INSERT INTO public_championship_events
       (auth, player_name, track_name, position, players_count, average_ranking_xp,
        points_delta, points_after, ranking_xp_at_race)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        input.auth,
        input.playerName,
        input.trackName,
        input.position,
        input.playersCount,
        input.averageRankingXp,
        input.pointsDelta,
        profile.championship_points,
        profile.ranking_xp,
      ],
    );

    await client.query("COMMIT");
    return normalizePublicCompetitionProfile(profile);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPublicChampionshipStandings(auths: string[]) {
  await ensureSchema();
  if (auths.length === 0) return [];

  const result = await getPool().query<PublicChampionshipStanding>(
    `WITH standings AS (
       SELECT
         auth,
         championship_points,
         ROW_NUMBER() OVER (
           ORDER BY championship_points DESC, ranking_xp DESC, updated_at ASC, auth ASC
         )::integer AS position,
         LAG(championship_points) OVER (
           ORDER BY championship_points DESC, ranking_xp DESC, updated_at ASC, auth ASC
         ) AS points_ahead
       FROM public_driver_profiles
     )
     SELECT
       auth,
       position,
       championship_points,
       CASE
         WHEN points_ahead IS NULL THEN NULL
         ELSE GREATEST(0, points_ahead - championship_points)
       END::integer AS points_behind_next
     FROM standings
     WHERE auth = ANY($1::varchar[])`,
    [auths],
  );

  return result.rows;
}
