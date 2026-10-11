import { createHmac, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import type { Note } from "@/lib/notes";

export const NOTES_SESSION_COOKIE = "notes_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const STORE_ROW_ID = "main";

export function isSyncConfigured() {
  return Boolean(
    (process.env.NOTES_PASSPHRASE || "").trim() &&
      (process.env.DATABASE_URL || "").trim()
  );
}

function sessionKey() {
  return (
    (process.env.NOTES_SESSION_SECRET || "").trim() ||
    (process.env.NOTES_PASSPHRASE || "").trim()
  );
}

function signature(payload: string) {
  return createHmac("sha256", sessionKey()).update(payload).digest("hex");
}

export function createSessionToken() {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `v1.${exp}`;
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !sessionKey()) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const [, expRaw, providedSig] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const expectedSig = signature(`v1.${expRaw}`);
  try {
    return timingSafeEqual(
      Buffer.from(providedSig || "", "utf8"),
      Buffer.from(expectedSig, "utf8")
    );
  } catch {
    return false;
  }
}

export function isPassphraseCorrect(candidate: string) {
  const expected = (process.env.NOTES_PASSPHRASE || "").trim();
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

let pool: Pool | null = null;
let syncHealth:
  | {
      checkedAt: number;
      ok: boolean;
      error?: string;
    }
  | null = null;

const SYNC_HEALTH_TTL_MS = 30_000;

function getPool() {
  const connectionString = (process.env.DATABASE_URL || "").trim();
  if (!connectionString) {
    throw new Error("Notes sync is not configured (missing DATABASE_URL).");
  }
  if (!pool) {
    const isLocal =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1") ||
      connectionString.includes("sslmode=disable");
    pool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      max: 3
    });
  }
  return pool;
}

export function syncErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "ENOTFOUND") {
    return "Could not resolve the database host. Check DATABASE_URL and use a reachable Postgres connection string.";
  }
  if (code === "ECONNREFUSED") {
    return "Could not connect to the notes database. Check that the database is running and accepting connections.";
  }
  if (code === "ETIMEDOUT" || code === "ETIMEOUT") {
    return "The notes database connection timed out. Check your network or database connection string.";
  }
  return "Could not reach the notes database.";
}

export async function checkSyncConnection({ force = false } = {}) {
  if (!isSyncConfigured()) {
    return {
      ok: false,
      error: "Notes sync is not configured."
    };
  }

  if (
    !force &&
    syncHealth &&
    Date.now() - syncHealth.checkedAt < SYNC_HEALTH_TTL_MS
  ) {
    return syncHealth;
  }

  try {
    await getPool().query("SELECT 1;");
    syncHealth = { checkedAt: Date.now(), ok: true };
    return syncHealth;
  } catch (error) {
    syncHealth = {
      checkedAt: Date.now(),
      ok: false,
      error: syncErrorMessage(error)
    };
    return syncHealth;
  }
}

export type SyncedState = {
  notes: Note[];
  updatedAt: number;
};

export async function readSyncedState(): Promise<SyncedState> {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS note_sync (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at BIGINT NOT NULL DEFAULT 0
      );
    `);
    const result = await client.query(
      "SELECT payload, updated_at FROM note_sync WHERE id = $1;",
      [STORE_ROW_ID]
    );
    const row = result.rows[0] as
      | { payload: unknown; updated_at: string | number }
      | undefined;
    if (!row) return { notes: [], updatedAt: 0 };
    const notes = Array.isArray((row.payload as { notes?: unknown })?.notes)
      ? ((row.payload as { notes: Note[] }).notes as Note[])
      : [];
    return { notes, updatedAt: Number(row.updated_at) || 0 };
  } finally {
    client.release();
  }
}

export async function writeSyncedState(notes: Note[]): Promise<number> {
  const updatedAt = Date.now();
  const client = await getPool().connect();
  try {
    await client.query(
      `INSERT INTO note_sync (id, payload, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         payload = EXCLUDED.payload,
         updated_at = EXCLUDED.updated_at;`,
      [STORE_ROW_ID, JSON.stringify({ notes }), updatedAt]
    );
    return updatedAt;
  } finally {
    client.release();
  }
}
