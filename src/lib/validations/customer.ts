import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
