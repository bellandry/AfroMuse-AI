import { z } from "zod";
import { createGeneration, processGeneration } from "../services/generations";
import { getGenerationForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const createInput = z.object({
  title: z.string().trim().min(2).max(160),
  prompt: z.string().trim().min(12).max(1500),
  style: z.enum(["afrobeats", "amapiano", "coupe-decale", "highlife", "mbalax", "rumba", "gospel", "afro-fusion"]),
  mood: z.enum(["solaire", "intense", "romantique", "spirituel", "nostalgique", "festif", "cinématique"]),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(120)]),
  mode: z.enum(["vocal", "instrumental"]),
  language: z.enum(["fr", "en"]),
});

export const generationsRouter = router({
  create: protectedProcedure.input(createInput).mutation(async ({ ctx, input }) => {
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
