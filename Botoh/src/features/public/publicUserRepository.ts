import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { Pool } from "pg";

export interface PublicUser {
  auth: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

let pool: Pool | null = null;
let schemaReady = false;

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
  await getPool().query(
    "CREATE INDEX IF NOT EXISTS public_users_name_idx ON public_users(LOWER(name))",
  );

  schemaReady = true;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const iterations = 120000;
  const keyLength = 32;
  const digest = "sha256";
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");

  return `pbkdf2:${digest}:${iterations}:${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [kind, digest, iterationsText, salt, storedHash] = passwordHash.split(":");
  if (kind !== "pbkdf2" || !digest || !iterationsText || !salt || !storedHash) {
    return false;
  }

  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const stored = Buffer.from(storedHash, "hex");
  const calculated = pbkdf2Sync(password, salt, iterations, stored.length, digest).toString("hex");
  const candidate = Buffer.from(calculated, "hex");

  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

export async function findPublicUserByAuth(auth: string): Promise<PublicUser | null> {
  await ensureSchema();

  const result = await getPool().query<PublicUser>(
    `SELECT auth, name, password_hash, created_at, updated_at, last_login_at
     FROM public_users
     WHERE auth = $1
     LIMIT 1`,
    [auth],
  );

  return result.rows[0] ?? null;
}

export async function createPublicUser(input: {
  auth: string;
  name: string;
  password: string;
}): Promise<PublicUser> {
  await ensureSchema();

  const result = await getPool().query<PublicUser>(
    `INSERT INTO public_users (auth, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING auth, name, password_hash, created_at, updated_at, last_login_at`,
    [input.auth, input.name, hashPassword(input.password)],
  );

  return result.rows[0];
}

export async function validatePublicUserLogin(auth: string, password: string, currentName: string) {
  const user = await findPublicUserByAuth(auth);
  if (!user) {
    return { success: false as const, code: "not_registered" as const };
  }

  if (!verifyPassword(password, user.password_hash)) {
    return { success: false as const, code: "incorrect_password" as const };
  }

  await getPool().query(
    "UPDATE public_users SET name = $1, last_login_at = NOW(), updated_at = NOW() WHERE auth = $2",
    [currentName, auth],
  );

  return { success: true as const, user: { ...user, name: currentName } };
}
