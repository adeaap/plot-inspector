import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { queryDeforestation } from "@/server/gfw";

// Matches GeoJSON's `Position`: an array of numbers, length 2 or 3.
const positionSchema = z.array(z.number()).min(2).max(3);

const linearRingSchema = z.array(positionSchema).min(4);

const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(linearRingSchema).min(1),
});

const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(linearRingSchema).min(1)).min(1),
});

export const geometrySchema = z.union([polygonSchema, multiPolygonSchema]);

const inputSchema = z.object({
  geometry: geometrySchema,
  sinceYear: z.number().int().min(2001).max(2100).optional(),
});

export const deforestationRouter = router({
  queryByPolygon: publicProcedure
    .input(inputSchema)
    .query(async ({ input }) => {
      return queryDeforestation(input.geometry, input.sinceYear);
    }),
});
