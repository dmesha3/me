import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  NOTES_SESSION_COOKIE,
  isSyncConfigured,
  verifySessionToken
} from "@/lib/notesServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const syncEnabled = isSyncConfigured();
  const unlocked =
    syncEnabled &&
    verifySessionToken(cookies().get(NOTES_SESSION_COOKIE)?.value);
  return NextResponse.json({ syncEnabled, unlocked });
}
