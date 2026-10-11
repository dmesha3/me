import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  NOTES_SESSION_COOKIE,
  isSyncConfigured,
  readSyncedState,
  syncErrorMessage,
  verifySessionToken,
  writeSyncedState
} from "@/lib/notesServer";
import { notesSyncSchema } from "@/lib/validation/notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUnlocked() {
  return verifySessionToken(cookies().get(NOTES_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!isSyncConfigured()) {
    return NextResponse.json(
      { error: "Notes sync is not configured." },
      { status: 501 }
    );
  }
  if (!isUnlocked()) {
    return NextResponse.json({ error: "Locked." }, { status: 401 });
  }
  try {
    const state = await readSyncedState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("Notes sync read failed:", error);
    return NextResponse.json(
      { error: syncErrorMessage(error) },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isSyncConfigured()) {
    return NextResponse.json(
      { error: "Notes sync is not configured." },
      { status: 501 }
    );
  }
  if (!isUnlocked()) {
    return NextResponse.json({ error: "Locked." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = notesSyncSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notes data." }, { status: 400 });
  }

  try {
    const stored = await readSyncedState();
    if (stored.updatedAt !== parsed.data.baseUpdatedAt) {
      return NextResponse.json(
        {
          error: "Notes changed on another device. Merge and retry.",
          notes: stored.notes,
          updatedAt: stored.updatedAt
        },
        { status: 409 }
      );
    }
    const updatedAt = await writeSyncedState(parsed.data.notes);
    return NextResponse.json({ updatedAt });
  } catch (error) {
    console.error("Notes sync write failed:", error);
    return NextResponse.json(
      { error: syncErrorMessage(error) },
      { status: 503 }
    );
  }
}
