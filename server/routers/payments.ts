import { z } from "zod";
import { creditPlans, createPaymentOrder } from "../services/payments";
import { protectedProcedure, router } from "../_core/trpc";

export const paymentsRouter = router({
  plans: protectedProcedure.query(() => creditPlans),
  createOrder: protectedProcedure.input(z.object({
    planCode: z.enum(["starter", "creator", "studio"]),
    provider: z.enum(["paystack", "flutterwave", "chariow"]),
  })).mutation(async ({ ctx, input }) => {
    const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
    return createPaymentOrder({
      userId: ctx.user.id, email: ctx.user.email, planCode: input.planCode,
      provider: input.provider, callbackUrl: `${origin}/credits?payment=returned`,
    });
  }),
});
