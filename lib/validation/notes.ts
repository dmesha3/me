import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().max(500),
  body: z.string().max(200000),
  tags: z.array(z.string().max(60)).max(50),
  pinned: z.boolean(),
  createdAt: z.number().finite(),
  updatedAt: z.number().finite()
});

export const notesSyncSchema = z.object({
  notes: z.array(noteSchema).max(2000),
  baseUpdatedAt: z.number().finite()
});

export const unlockSchema = z.object({
  passphrase: z.string().min(1).max(200)
});

export type NotesSyncInput = z.input<typeof notesSyncSchema>;
