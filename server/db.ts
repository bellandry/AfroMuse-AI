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
