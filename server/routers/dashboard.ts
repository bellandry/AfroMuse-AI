import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { creditLedgerEntries, musicGenerations } from "../../drizzle/schema";
import { db, listGenerationsForUser, listLibraryForUser } from "../db";
import { getCreditBalance } from "../services/credits";
import { protectedProcedure, router } from "../_core/trpc";

export const dashboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const wallet = await getCreditBalance(ctx.user.id);
    const [generations, ledger] = await Promise.all([
      listGenerationsForUser(ctx.user.id),
      db.select().from(creditLedgerEntries).where(eq(creditLedgerEntries.userId, ctx.user.id)).orderBy(desc(creditLedgerEntries.createdAt)).limit(6),
    ]);
    return { wallet, generations: generations.slice(0, 6), ledger };
  }),
  library: protectedProcedure.query(({ ctx }) => listLibraryForUser(ctx.user.id)),
  generationById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [generation] = await db.select().from(musicGenerations).where(eq(musicGenerations.id, input.id)).limit(1);
    if (!generation || generation.userId !== ctx.user.id) return null;
    return generation;
  }),
});
