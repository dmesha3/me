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
      ssl: isLocal ? undefined : { rejectUnauthorized: false }
    });
  }
  return pool;
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
