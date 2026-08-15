import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { dashboardRouter } from "./routers/dashboard";
import { generationsRouter } from "./routers/generations";
import { paymentsRouter } from "./routers/payments";
import { whatsappRouter } from "./routers/whatsapp";
import { contactRouter } from "./routers/contact";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),
  dashboard: dashboardRouter,
  generations: generationsRouter,
  payments: paymentsRouter,
  whatsapp: whatsappRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
