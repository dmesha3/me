import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  NOTES_SESSION_COOKIE,
  checkSyncConnection,
  isSyncConfigured,
  verifySessionToken
} from "@/lib/notesServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSyncConfigured()) {
    return NextResponse.json({ syncEnabled: false, unlocked: false });
  }

  const health = await checkSyncConnection();
  if (!health.ok) {
    return NextResponse.json({
      syncEnabled: false,
      unlocked: false,
      syncError: health.error
    });
  }

  const unlocked =
    verifySessionToken(cookies().get(NOTES_SESSION_COOKIE)?.value);
  return NextResponse.json({ syncEnabled: true, unlocked });
}
