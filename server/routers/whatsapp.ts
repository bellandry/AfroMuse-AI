import { z } from "zod";
import { authUsers } from "../../drizzle/schema";
import { db } from "../db";
import { requestWhatsappOtp, verifyWhatsappOtp } from "../services/whatsapp-otp";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { eq } from "drizzle-orm";

export const whatsappRouter = router({
  requestOtp: publicProcedure.input(z.object({ phoneNumber: z.string(), email: z.string().email() }))
    .mutation(({ input }) => requestWhatsappOtp(input.phoneNumber, input.email)),
  verifyOtp: publicProcedure.input(z.object({ phoneNumber: z.string(), code: z.string() }))
    .mutation(({ input }) => verifyWhatsappOtp(input.phoneNumber, input.code)),
  updatePhone: protectedProcedure.input(z.object({ phoneNumber: z.string() })).mutation(async ({ ctx, input }) => {
    // A new number only replaces the existing number after email OTP verification.
    return requestWhatsappOtp(input.phoneNumber, ctx.user.email);
  }),
});
