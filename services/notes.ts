import { api } from "@/services/api";
import type { Note } from "@/lib/notes";

export const notesQueryKeys = {
  session: ["notes", "session"] as const,
  synced: ["notes", "synced"] as const
};

export type NotesSession = {
  syncEnabled: boolean;
  unlocked: boolean;
};

export type SyncedNotesState = {
  notes: Note[];
  updatedAt: number;
};

type PushNotesInput = {
  notes: Note[];
  baseUpdatedAt: number;
};

type PushNotesResult = {
  updatedAt: number;
};

export async function getNotesSession(): Promise<NotesSession> {
  const response = await api.get<NotesSession>("/notes/session");
  return response.data;
}

export async function getSyncedNotes(): Promise<SyncedNotesState> {
  const response = await api.get<SyncedNotesState>("/notes");
  return response.data;
}

export async function pushSyncedNotes(
  input: PushNotesInput
): Promise<PushNotesResult> {
  const response = await api.put<PushNotesResult>("/notes", input);
  return response.data;
}

export async function unlockNotes(passphrase: string): Promise<void> {
  await api.post("/notes/unlock", { passphrase });
}

export async function lockNotes(): Promise<void> {
  await api.post("/notes/lock");
}
