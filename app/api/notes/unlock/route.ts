import { NextRequest, NextResponse } from "next/server";
import {
  NOTES_SESSION_COOKIE,
  checkSyncConnection,
  createSessionToken,
  isPassphraseCorrect,
  isSyncConfigured,
  sessionCookieOptions
} from "@/lib/notesServer";
import { unlockSchema } from "@/lib/validation/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isAllowed(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
}

export async function POST(request: NextRequest) {
  if (!isSyncConfigured()) {
    return NextResponse.json(
      { error: "Notes sync is not configured." },
      { status: 501 }
    );
  }
  if (!isAllowed(clientKey(request))) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(payload);
  if (!parsed.success || !isPassphraseCorrect(parsed.data.passphrase.trim())) {
    return NextResponse.json({ error: "Wrong passphrase." }, { status: 401 });
  }

  const health = await checkSyncConnection({ force: true });
  if (!health.ok) {
    return NextResponse.json(
      { error: health.error || "Could not reach the notes database." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    NOTES_SESSION_COOKIE,
    createSessionToken(),
    sessionCookieOptions()
  );
  return response;
}
