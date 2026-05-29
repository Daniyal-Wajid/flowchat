import { z } from "zod";

export const appointmentSchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1).max(200).default("Appointment"),
  scheduledAt: z.string().min(1),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"])
    .optional(),
  notes: z.string().max(2000).optional(),
  sendConfirmation: z.boolean().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
