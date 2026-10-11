export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export const NOTES_STORAGE_KEY = "portfolio-notes";
const STORAGE_VERSION = 1;

type StoredNotes = {
  version: number;
  notes: Note[];
};

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === "string") &&
    typeof note.pinned === "boolean" &&
    typeof note.createdAt === "number" &&
    typeof note.updatedAt === "number"
  );
}

export function createNote(overrides: Partial<Note> = {}): Note {
  const now = Date.now();
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `note-${now}-${Math.random().toString(36).slice(2)}`,
    title: "",
    body: "",
    tags: [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function parseNotes(raw: string | null): Note[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<StoredNotes> | Note[];
    const list = Array.isArray(parsed) ? parsed : parsed?.notes;
    if (!Array.isArray(list)) return [];
    return list.filter(isNote);
  } catch {
    return [];
  }
}

export function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  return parseNotes(window.localStorage.getItem(NOTES_STORAGE_KEY));
}

export function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  const payload: StoredNotes = { version: STORAGE_VERSION, notes };
  window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(payload));
}

export function mergeNotes(local: Note[], remote: Note[]): Note[] {
  const merged = new Map<string, Note>();
  for (const note of [...local, ...remote]) {
    const existing = merged.get(note.id);
    if (!existing || note.updatedAt >= existing.updatedAt) {
      merged.set(note.id, note);
    }
  }
  return [...merged.values()];
}

export function notesFingerprint(notes: Note[]): string {
  return notes
    .map((note) => `${note.id}:${note.updatedAt}`)
    .sort()
    .join("|");
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function noteMatches(note: Note, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    note.title.toLowerCase().includes(normalized) ||
    note.body.toLowerCase().includes(normalized) ||
    note.tags.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

export function notePreview(note: Note): string {
  const firstLine = note.body.replace(/\s+/g, " ").trim();
  return firstLine.length > 90 ? `${firstLine.slice(0, 90)}…` : firstLine;
}

export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag) return false;
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function formatNoteAsText(note: Note): string {
  const lines: string[] = [];
  if (note.title.trim()) lines.push(note.title.trim());
  if (note.body.trim()) {
    if (lines.length) lines.push("");
    lines.push(note.body.trim());
  }
  if (note.tags.length) {
    lines.push("");
    lines.push(note.tags.map((tag) => `#${tag}`).join(" "));
  }
  return lines.join("\n");
}

export function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
