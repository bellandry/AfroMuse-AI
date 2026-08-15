import crypto from "node:crypto";
import { z } from "zod";
import { auditLogs } from "../../drizzle/schema";
import { db } from "../db";
import { sendContactEmail } from "../email";
import { publicProcedure, router } from "../_core/trpc";

export const contactRouter = router({
  submit: publicProcedure.input(z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email().max(320),
    message: z.string().trim().min(20).max(4000),
  })).mutation(async ({ input }) => {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(), action: "contact.submitted", entityType: "contact", entityId: crypto.randomUUID(),
      metadata: { name: input.name, email: input.email, messageLength: input.message.length },
    });
    await sendContactEmail(input);
    return { accepted: true } as const;
  }),
});
