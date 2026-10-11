import { NextResponse } from "next/server";
import { NOTES_SESSION_COOKIE } from "@/lib/notesServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(NOTES_SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0
  });
  return response;
}
