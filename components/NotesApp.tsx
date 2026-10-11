"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import {
  createNote,
  downloadFile,
  formatNoteAsText,
  loadNotes,
  mergeNotes,
  noteMatches,
  notePreview,
  notesFingerprint,
  parseNotes,
  parseTags,
  saveNotes,
  sortNotes,
  type Note
} from "@/lib/notes";
import {
  getNotesSession,
  getSyncedNotes,
  lockNotes,
  notesQueryKeys,
  pushSyncedNotes,
  unlockNotes,
  type NotesSession
} from "@/services/notes";

type Filter = "all" | "pinned";

type UnlockFormValues = {
  passphrase: string;
};

type NoteFormValues = {
  title: string;
  body: string;
  tags: string;
};

const apiStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const apiMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data;
  if (data && typeof data === "object" && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string") return message;
  }
  return fallback;
};

export function NotesApp() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [syncDisabled, setSyncDisabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const notesRef = useRef<Note[]>([]);
  const selectedIdRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);
  const busyRef = useRef(false);
  const dirtyRef = useRef(false);
  const serverRevRef = useRef(0);
  const pushTimerRef = useRef<number | null>(null);

  notesRef.current = notes;
  selectedIdRef.current = selectedId;

  const unlockForm = useForm<UnlockFormValues>({
    defaultValues: {
      passphrase: ""
    }
  });

  const noteForm = useForm<NoteFormValues>({
    defaultValues: {
      title: "",
      body: "",
      tags: ""
    }
  });

  const sessionQuery = useQuery({
    queryKey: notesQueryKeys.session,
    queryFn: getNotesSession,
    retry: false,
    staleTime: 60_000
  });

  const {
    mutateAsync: pushNotes,
    isPending: isPushPending
  } = useMutation({
    mutationFn: pushSyncedNotes
  });

  const {
    mutateAsync: pullNotes,
    isPending: isPullPending
  } = useMutation({
    mutationFn: getSyncedNotes
  });

  const {
    mutateAsync: unlockSync,
    isPending: isUnlockPending
  } = useMutation({
    mutationFn: unlockNotes
  });

  const {
    mutateAsync: lockSync,
    isPending: isLockPending
  } = useMutation({
    mutationFn: lockNotes
  });

  const syncEnabled = syncDisabled
    ? false
    : sessionQuery.data?.syncEnabled ?? null;
  const syncBusy = isPushPending || isPullPending;

  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  useEffect(() => {
    busyRef.current = syncBusy;
  }, [syncBusy]);

  useEffect(() => {
    if (sessionQuery.data) {
      setSyncDisabled(!sessionQuery.data.syncEnabled);
      setUnlocked(sessionQuery.data.syncEnabled && sessionQuery.data.unlocked);
    }
  }, [sessionQuery.data]);

  useEffect(() => {
    if (sessionQuery.isError) setSyncDisabled(true);
  }, [sessionQuery.isError]);

  const doPush = useCallback(async (snapshot: Note[]) => {
    if (!unlockedRef.current || busyRef.current) return;
    setSyncError(null);
    try {
      const body = await pushNotes({
        notes: snapshot,
        baseUpdatedAt: serverRevRef.current
      });
      serverRevRef.current = body.updatedAt;
      dirtyRef.current = false;
      setLastSyncedAt(Date.now());
    } catch (error) {
      const status = apiStatus(error);
      if (status === 401) {
        setUnlocked(false);
        return;
      }
      if (status === 501) {
        setSyncDisabled(true);
        return;
      }
      if (status === 409 && axios.isAxiosError(error)) {
        const body = error.response?.data as
          | {
              notes: Note[];
              updatedAt: number;
            }
          | undefined;
        if (!body) {
          setSyncError("Sync failed. Your notes are safe on this device and will retry.");
          return;
        }
        serverRevRef.current = body.updatedAt;
        const merged = mergeNotes(notesRef.current, parseNotes(JSON.stringify(body.notes)));
        setNotes(merged);
        return;
      }
      setSyncError("Sync failed. Your notes are safe on this device and will retry.");
    }
  }, [pushNotes]);

  const schedulePush = useCallback(() => {
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    pushTimerRef.current = window.setTimeout(() => {
      void doPush(notesRef.current);
    }, 1000);
  }, [doPush]);

  const pull = useCallback(async () => {
    if (!unlockedRef.current || busyRef.current) return;
    setSyncError(null);
    try {
      const body = await pullNotes();
      const remote = parseNotes(JSON.stringify(body.notes));
      serverRevRef.current = body.updatedAt;
      const before = notesFingerprint(notesRef.current);
      const merged = mergeNotes(notesRef.current, remote);
      if (notesFingerprint(merged) !== before) {
        dirtyRef.current = true;
        setNotes(merged);
        schedulePush();
      } else {
        setLastSyncedAt(Date.now());
      }
    } catch (error) {
      const status = apiStatus(error);
      if (status === 401) {
        setUnlocked(false);
        return;
      }
      if (status === 501) {
        setSyncDisabled(true);
        return;
      }
      setSyncError("Sync failed. Your notes are safe on this device and will retry.");
    }
  }, [pullNotes, schedulePush]);

  useEffect(() => {
    setNotes(loadNotes());
    setLoaded(true);

    const onFocus = () => {
      if (unlockedRef.current && !dirtyRef.current) void pull();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    };
  }, [pull]);

  useEffect(() => {
    if (loaded && unlockedRef.current) void pull();
  }, [loaded, pull, unlocked]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => saveNotes(notes), 300);
    dirtyRef.current = true;
    schedulePush();
    return () => window.clearTimeout(timer);
  }, [notes, loaded, schedulePush]);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  useEffect(() => {
    noteForm.reset({
      title: selected?.title ?? "",
      body: selected?.body ?? "",
      tags: selected?.tags.join(", ") ?? ""
    });
    // Reset only when switching notes, otherwise the form would fight the cursor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, noteForm]);

  const visibleNotes = useMemo(() => {
    const base = filter === "pinned" ? notes.filter((note) => note.pinned) : notes;
    return sortNotes(base.filter((note) => noteMatches(note, query)));
  }, [notes, query, filter]);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...patch, updatedAt: Date.now() } : note
      )
    );
  }, []);

  useEffect(() => {
    const subscription = noteForm.watch((values, { name }) => {
      const id = selectedIdRef.current;
      if (!id || !name) return;

      if (name === "title") {
        updateNote(id, { title: values.title ?? "" });
      }
      if (name === "body") {
        updateNote(id, { body: values.body ?? "" });
      }
    });

    return () => subscription.unsubscribe();
  }, [noteForm, updateNote]);

  const handleCreate = () => {
    const note = createNote({ title: "Untitled note" });
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
    setQuery("");
    setFilter("all");
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleCopy = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(formatNoteAsText(note));
      setCopiedId(note.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  const handleUnlock = unlockForm.handleSubmit(async ({ passphrase }) => {
    unlockForm.clearErrors("passphrase");
    try {
      await unlockSync(passphrase);
      unlockForm.reset();
      setUnlocked(true);
      queryClient.setQueryData<NotesSession>(notesQueryKeys.session, {
        syncEnabled: true,
        unlocked: true
      });
    } catch (error) {
      unlockForm.setError("passphrase", {
        type: "server",
        message: apiMessage(error, "Could not unlock.")
      });
    }
  });

  const handleLock = async () => {
    try {
      await lockSync();
    } catch {
      // Cookie may already be gone; lock the UI regardless.
    }
    setUnlocked(false);
    queryClient.setQueryData<NotesSession>(notesQueryKeys.session, {
      syncEnabled: true,
      unlocked: false
    });
    serverRevRef.current = 0;
    setLastSyncedAt(null);
  };

  const handleExportJson = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(
      `notes-${stamp}.json`,
      JSON.stringify({ version: 1, notes }, null, 2),
      "application/json"
    );
  };

  const handleExportMarkdown = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const markdown = notes
      .map((note) => {
        const heading = note.title.trim() || "Untitled note";
        const tags = note.tags.length
          ? `\n\n${note.tags.map((tag) => `#${tag}`).join(" ")}`
          : "";
        return `# ${heading}\n\n${note.body.trim()}${tags}`;
      })
      .join("\n\n---\n\n");
    downloadFile(`notes-${stamp}.md`, markdown, "text/markdown");
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const incoming = parseNotes(text);
    if (!incoming.length) return;
    setNotes((prev) => {
      const existing = new Set(prev.map((note) => note.id));
      const merged = [...prev];
      for (const note of incoming) {
        merged.push(
          existing.has(note.id) ? { ...note, id: createNote().id } : note
        );
      }
      return merged;
    });
  };

  const commitTags = () => {
    const id = selectedIdRef.current;
    if (id) updateNote(id, { tags: parseTags(noteForm.getValues("tags")) });
  };

  const syncStatus = syncBusy
    ? "Syncing..."
    : syncError
      ? "Sync failed - will retry on next change"
      : lastSyncedAt
        ? `Synced · ${new Date(lastSyncedAt).toLocaleTimeString()}`
        : unlocked
          ? "Connected"
          : null;

  return (
    <>
      {syncEnabled !== null && (
        <div className="mb-4 flex flex-col gap-3 border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {syncEnabled === false &&
              "Stored on this device only - sync not configured"}
            {syncEnabled && !unlocked && "Sync available - unlock to sync devices"}
            {syncEnabled && unlocked && (syncStatus || "Connected")}
          </p>
          {syncEnabled && !unlocked && (
            <form onSubmit={handleUnlock} className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                placeholder="Sync passphrase"
                autoComplete="current-password"
                disabled={isUnlockPending}
                className="border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus-visible:border-fg disabled:cursor-not-allowed disabled:opacity-60"
                {...unlockForm.register("passphrase", {
                  required: "Enter the sync passphrase."
                })}
              />
              <Button
                type="submit"
                variant="secondary"
                className="px-4 py-2"
                disabled={isUnlockPending}
              >
                {isUnlockPending ? "Unlocking" : "Unlock"}
              </Button>
              {unlockForm.formState.errors.passphrase?.message && (
                <span className="text-xs text-muted">
                  {unlockForm.formState.errors.passphrase.message}
                </span>
              )}
            </form>
          )}
          {syncEnabled && unlocked && (
            <button
              type="button"
              onClick={handleLock}
              disabled={isLockPending}
              className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Lock
            </button>
          )}
        </div>
      )}

      <div className="border border-border">
        <div className="flex flex-col gap-4 border-b border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes"
              className="w-full border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus-visible:border-fg"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex border border-border">
              {(["all", "pinned"] as Filter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={cn(
                    "px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors",
                    filter === option
                      ? "bg-accent text-accentFg"
                      : "text-muted hover:text-fg"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button onClick={handleCreate} variant="primary" className="px-4 py-2">
              New note
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr]">
          <div
            className={cn(
              "border-border lg:border-r",
              selected ? "hidden lg:block" : "block"
            )}
          >
            {!loaded ? (
              <p className="p-6 text-sm text-muted">Loading notes...</p>
            ) : visibleNotes.length === 0 ? (
              <p className="p-6 text-sm text-muted">
                {notes.length === 0
                  ? "No notes yet. Create your first note to start capturing ideas."
                  : "No notes match your search."}
              </p>
            ) : (
              <ul className="max-h-[70vh] overflow-y-auto">
                {visibleNotes.map((note) => (
                  <li key={note.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(note.id)}
                      className={cn(
                        "w-full px-4 py-4 text-left transition-colors hover:bg-surface",
                        selectedId === note.id && "bg-surface"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm text-fg">
                          {note.title.trim() || "Untitled note"}
                        </span>
                        {note.pinned && (
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted">
                            Pinned
                          </span>
                        )}
                      </div>
                      {notePreview(note) && (
                        <p className="mt-2 truncate text-xs text-muted">
                          {notePreview(note)}
                        </p>
                      )}
                      {note.tags.length > 0 && (
                        <p className="mt-2 truncate text-[10px] uppercase tracking-[0.2em] text-muted">
                          {note.tags.map((tag) => `#${tag}`).join("  ")}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn("p-6", selected ? "block" : "hidden lg:block")}>
            {selected ? (
              <div className="flex h-full flex-col gap-5">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-left text-xs uppercase tracking-[0.2em] text-muted lg:hidden"
                >
                  Back to notes
                </button>

                <input
                  placeholder="Note title"
                  className="w-full border-0 border-b border-border bg-transparent pb-3 font-display text-2xl text-fg placeholder:text-muted focus:outline-none focus-visible:border-fg"
                  {...noteForm.register("title")}
                />

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    Tags (comma separated)
                  </label>
                  <input
                    placeholder="books, ideas, cafe"
                    className="mt-2 w-full border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus-visible:border-fg"
                    {...noteForm.register("tags", {
                      onBlur: commitTags
                    })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitTags();
                      }
                    }}
                  />
                </div>

                <textarea
                  placeholder="Start typing..."
                  spellCheck
                  className="min-h-[40vh] w-full flex-1 resize-y border border-border bg-bg p-4 text-sm leading-relaxed text-fg placeholder:text-muted focus:outline-none focus-visible:border-fg"
                  {...noteForm.register("body")}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateNote(selected.id, { pinned: !selected.pinned })
                      }
                      className="px-4 py-2"
                    >
                      {selected.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleCopy(selected)}
                      className="px-4 py-2"
                    >
                      {copiedId === selected.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selected.id)}
                    className="px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  {selected.body.trim().split(/\s+/).filter(Boolean).length} words ·
                  Updated {new Date(selected.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-muted">
                  Select a note from the list or create a new one.
                </p>
                <Button onClick={handleCreate} variant="outline" className="px-4 py-2">
                  Create note
                </Button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <button
                type="button"
                onClick={handleExportJson}
                className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-fg"
              >
                Export JSON
              </button>
              <span className="text-muted">·</span>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-fg"
              >
                Export Markdown
              </button>
              <span className="text-muted">·</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-fg"
              >
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImport(file);
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
