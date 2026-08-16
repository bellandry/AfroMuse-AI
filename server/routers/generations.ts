import { z } from "zod";
import { createGeneration, processGeneration } from "../services/generations";
import { getGenerationForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const generationInput = z.object({
  title: z.string().trim().min(2).max(160),
  prompt: z.string().trim().min(12).max(1500),
  style: z.enum(["afrobeats", "amapiano", "coupe-decale", "highlife", "mbalax", "rumba", "gospel", "afro-fusion"]),
  mood: z.enum(["solaire", "intense", "romantique", "spirituel", "nostalgique", "festif", "cinématique"]),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(120), z.literal(180)]),
  mode: z.enum(["vocal", "instrumental"]),
  language: z.enum(["fr", "en"]),
  lyricsMode: z.enum(["none", "generate", "custom"]).default("none"),
  lyrics: z.string().trim().min(10).max(8000).optional(),
  vocalLanguage: z.enum(["fr", "en", "auto"]).default("auto"),
  songStructure: z.array(z.object({
    type: z.enum(["intro", "verse", "pre-chorus", "chorus", "bridge", "outro"]),
    label: z.string().trim().max(80).optional(),
    durationSeconds: z.number().int().min(3).max(120).optional(),
    lyrics: z.string().trim().max(3000).optional(),
  })).max(10).optional(),
}).superRefine((value, ctx) => {
  if (value.mode === "instrumental" && value.lyricsMode !== "none") ctx.addIssue({ code: "custom", path: ["lyricsMode"], message: "Les paroles sont réservées au mode avec voix." });
  if (value.mode === "vocal" && value.lyricsMode === "custom" && !value.lyrics) ctx.addIssue({ code: "custom", path: ["lyrics"], message: "Ajoutez vos paroles ou choisissez les paroles assistées." });
  if (value.mode === "vocal" && value.lyricsMode === "none") ctx.addIssue({ code: "custom", path: ["lyricsMode"], message: "Choisissez des paroles assistées ou vos propres paroles pour une chanson avec voix." });
});

export const generationsRouter = router({
  create: protectedProcedure.input(generationInput).mutation(async ({ ctx, input }) => {
    return createGeneration(ctx.user.id, input);
  }),
  processForDevelopment: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    // In production, this call is made by a deployed job handler or provider callback,
    // never by a browser request. It remains available for local integration testing.
    const generation = await getGenerationForUser(ctx.user.id, input.id);
    if (!generation) throw new Error("Accès non autorisé.");
    const result = await processGeneration(input.id);
    return result;
  }),
});
