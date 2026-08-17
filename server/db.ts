import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialise AfroMuse AI.");
}

export const db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });

export async function getWalletForUser(userId: string) {
  const [wallet] = await db.select().from(schema.creditWallets)
    .where(eq(schema.creditWallets.userId, userId)).limit(1);
  return wallet;
}

export async function listGenerationsForUser(userId: string) {
  return db.select().from(schema.musicGenerations)
    .where(eq(schema.musicGenerations.userId, userId))
    .orderBy(desc(schema.musicGenerations.createdAt));
}

type LibraryGeneration = typeof schema.musicGenerations.$inferSelect;
type LibraryAudio = typeof schema.audioAssets.$inferSelect;

export function toLibraryItem(generation: LibraryGeneration, audio: LibraryAudio | null) {
  return toLibraryItemWithAssets(generation, audio ? [audio] : []);
}

export function toLibraryItemWithAssets(generation: LibraryGeneration, audioAssets: LibraryAudio[]) {
  const primaryAudio = audioAssets.find(asset => asset.variant === "master") ?? audioAssets[0] ?? null;
  const effectiveDurationSeconds = generation.actualDurationSeconds ?? primaryAudio?.durationSeconds ?? null;
  return {
    ...generation,
    audioUrl: primaryAudio?.publicUrl ?? null,
    effectiveDurationSeconds,
    audio: primaryAudio ? {
      id: primaryAudio.id,
      variant: primaryAudio.variant,
      filename: primaryAudio.filename,
      format: primaryAudio.format,
      durationSeconds: primaryAudio.durationSeconds,
      sizeBytes: primaryAudio.sizeBytes,
    } : null,
    audioVariants: audioAssets.map(asset => ({ id: asset.id, variant: asset.variant, filename: asset.filename, publicUrl: asset.publicUrl, format: asset.format, durationSeconds: asset.durationSeconds, sizeBytes: asset.sizeBytes })),
  };
}

export async function listLibraryForUser(userId: string) {
  const rows = await db.select({ generation: schema.musicGenerations, audio: schema.audioAssets })
    .from(schema.musicGenerations)
    .leftJoin(schema.audioAssets, eq(schema.audioAssets.generationId, schema.musicGenerations.id))
    .where(eq(schema.musicGenerations.userId, userId))
    .orderBy(desc(schema.musicGenerations.createdAt));
  const grouped = new Map<string, { generation: LibraryGeneration; audioAssets: LibraryAudio[] }>();
  for (const { generation, audio } of rows) {
    const entry = grouped.get(generation.id) ?? { generation, audioAssets: [] };
    if (audio) entry.audioAssets.push(audio);
    grouped.set(generation.id, entry);
  }
  return Array.from(grouped.values(), ({ generation, audioAssets }) => toLibraryItemWithAssets(generation, audioAssets));
}

export async function getGenerationForUser(userId: string, generationId: string) {
  const [generation] = await db.select().from(schema.musicGenerations)
    .where(and(eq(schema.musicGenerations.id, generationId), eq(schema.musicGenerations.userId, userId)))
    .limit(1);
  return generation;
}

export async function getAudioAssetForGeneration(userId: string, generationId: string) {
  const [asset] = await db.select().from(schema.audioAssets)
    .where(and(eq(schema.audioAssets.userId, userId), eq(schema.audioAssets.generationId, generationId)))
    .limit(1);
  return asset;
}

/**
 * Compatibility shim for the unused template OAuth SDK. AfroMuse uses Better Auth
 * and never hydrates application users from the template provider.
 */
export async function getUserByOpenId(_openId: string) {
  return undefined;
}

export async function upsertUser(_legacyUser: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  return;
}
