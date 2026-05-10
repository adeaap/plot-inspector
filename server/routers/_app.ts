import { router } from "@/server/trpc";
import { deforestationRouter } from "@/server/routers/deforestation";

export const appRouter = router({
  deforestation: deforestationRouter,
});

export type AppRouter = typeof appRouter;
