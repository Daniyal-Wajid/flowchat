import { z } from "zod";

export const businessUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  timezone: z.string().min(1).max(64).optional(),
});

export type BusinessUpdateInput = z.infer<typeof businessUpdateSchema>;
