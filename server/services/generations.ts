import crypto from "node:crypto";
import { and, eq, gt, inArray, isNull, lte, or } from "drizzle-orm";
import { auditLogs, audioAssets, musicGenerations } from "../../drizzle/schema";
import { whatsappIdentities } from "../../drizzle/schema";
import { db } from "../db";
import { storagePut } from "../storage";
import { ElevenMusicProvider } from "../providers/eleven-music";
import type { MusicGenerationInput, MusicProvider } from "../providers/contracts";
import { consumeReservation, releaseReservation, reserveCredits } from "./credits";
import { OpenWAProvider } from "../providers/openwa";

const musicProvider: MusicProvider = new ElevenMusicProvider();
const MAX_RETRIES = 3;
const HOURLY_GENERATION_LIMIT = 12;

export function canProcessGeneration(status: "queued" | "processing" | "completed" | "failed" | "cancelled", retryCount: number) {
  return !["completed", "cancelled"].includes(status) && !(status === "failed" && retryCount >= MAX_RETRIES);
}

export async function createGeneration(userId: string, input: Omit<MusicGenerationInput, "requestId">) {
  const recent = await db.select({ id: musicGenerations.id }).from(musicGenerations).where(and(
    eq(musicGenerations.userId, userId), gt(musicGenerations.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
  ));
  if (recent.length >= HOURLY_GENERATION_LIMIT) throw new Error("Limite de 12 générations par heure atteinte. Réessayez un peu plus tard.");
  const generationId = crypto.randomUUID();
  const fullInput = { ...input, requestId: generationId };
  const creditsReserved = musicProvider.estimateCredits(fullInput);
  await reserveCredits(userId, creditsReserved, { referenceType: "generation", referenceId: generationId });
  await db.insert(musicGenerations).values({
    id: generationId, userId, title: input.title, prompt: input.prompt, style: input.style, mood: input.mood,
    durationSeconds: input.durationSeconds, mode: input.mode, language: input.language, lyricsMode: input.lyricsMode,
    lyrics: input.lyrics ?? null, vocalLanguage: input.vocalLanguage, songStructure: input.songStructure ?? null,
    provider: musicProvider.id, creditsReserved,
  });
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(), userId, action: "generation.queued", entityType: "generation", entityId: generationId,
    metadata: { style: input.style, mood: input.mood, durationSeconds: input.durationSeconds, mode: input.mode, lyricsMode: input.lyricsMode, vocalLanguage: input.vocalLanguage, hasStructure: Boolean(input.songStructure?.length), creditsReserved },
  });
  return { id: generationId, creditsReserved, status: "queued" as const };
}

export async function processGeneration(generationId: string) {
  const [generation] = await db.select().from(musicGenerations).where(eq(musicGenerations.id, generationId)).limit(1);
  if (!generation || !canProcessGeneration(generation.status, generation.retryCount)) return generation;

  await db.update(musicGenerations).set({ status: "processing", startedAt: new Date(), lastError: null, nextRetryAt: null }).where(and(eq(musicGenerations.id, generationId), inArray(musicGenerations.status, ["queued", "failed"])));
  try {
    const result = await musicProvider.createGeneration({
      requestId: generation.id, title: generation.title, prompt: generation.prompt, style: generation.style, mood: generation.mood,
      durationSeconds: generation.durationSeconds, mode: generation.mode, language: generation.language,
      lyricsMode: generation.lyricsMode, lyrics: generation.lyrics, vocalLanguage: generation.vocalLanguage,
      songStructure: generation.songStructure as MusicGenerationInput["songStructure"],
    });
    if (result.status !== "completed" || !result.outputUrl) {
      await db.update(musicGenerations).set({ providerJobId: result.providerJobId, status: result.status }).where(eq(musicGenerations.id, generationId));
      return result;
    }

    const audioBuffer = Buffer.from(result.outputUrl.split(",")[1] ?? "", "base64");
    const stored = await storagePut(`music/${generation.userId}/${generation.id}.mp3`, audioBuffer, "audio/mpeg");
    await db.transaction(async tx => {
      await tx.insert(audioAssets).values({ id: crypto.randomUUID(), generationId: generation.id, userId: generation.userId, storageKey: stored.key, publicUrl: stored.url, format: "mp3", durationSeconds: generation.durationSeconds, sizeBytes: audioBuffer.length });
      await tx.update(musicGenerations).set({ providerJobId: result.providerJobId, providerPlanId: result.providerPlanId ?? null, actualDurationSeconds: result.actualDurationSeconds ?? generation.durationSeconds, status: "completed", completedAt: new Date() }).where(eq(musicGenerations.id, generationId));
    });
    await consumeReservation(generation.userId, generation.creditsReserved, { referenceType: "generation", referenceId: generation.id });
    const [identity] = await db.select().from(whatsappIdentities).where(eq(whatsappIdentities.userId, generation.userId)).limit(1);
    if (identity) {
      try {
        await new OpenWAProvider().sendAudio({ recipient: identity.phoneNumber, url: stored.url, filename: `${generation.title}.mp3` });
      } catch (deliveryError) {
        console.error("[WhatsApp delivery]", deliveryError);
      }
    }
    return { ...result, outputUrl: stored.url };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec inconnu de génération.";
    const retryCount = generation.retryCount + 1;
    const exhausted = retryCount >= MAX_RETRIES;
    await db.update(musicGenerations).set({
      status: exhausted ? "failed" : "queued", lastError: message, retryCount,
      nextRetryAt: exhausted ? null : new Date(Date.now() + 60_000 * 2 ** (retryCount - 1)),
    }).where(eq(musicGenerations.id, generationId));
    if (exhausted) await releaseReservation(generation.userId, generation.creditsReserved, { referenceType: "generation", referenceId: generation.id });
    return { providerJobId: generation.providerJobId ?? generation.id, status: exhausted ? "failed" as const : "queued" as const, errorMessage: message };
  }
}

export async function processPendingGenerations(limit = 10) {
  const now = new Date();
  const generations = await db.select().from(musicGenerations).where(and(
    inArray(musicGenerations.status, ["queued", "failed"]),
    or(isNull(musicGenerations.nextRetryAt), lte(musicGenerations.nextRetryAt, now)),
  )).limit(limit);
  const results = await Promise.allSettled(generations.map(item => processGeneration(item.id)));
  return { scanned: generations.length, completed: results.filter(item => item.status === "fulfilled").length, failed: results.filter(item => item.status === "rejected").length };
}
