import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { whatsAppService } from "@/lib/messaging/service";

export type ReminderRunResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: { appointmentId: string; error: string }[];
};

export const reminderService = {
  /**
   * Sends reminders for appointments in the next 24 hours that have not been reminded yet.
   */
  async runDueReminders(): Promise<ReminderRunResult> {
    const now = new Date();
    const windowEnd = addHours(now, 24);

    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: now, lte: windowEnd },
        reminderSentAt: null,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        business: {
          status: { in: ["ACTIVE", "TRIAL"] },
          billingStatus: { not: "CANCELED" },
        },
      },
      select: { id: true, businessId: true },
    });

    const result: ReminderRunResult = {
      processed: appointments.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    for (const apt of appointments) {
      try {
        const sendResult = await whatsAppService.sendReminder(apt.id, apt.businessId);
        if (sendResult.success) {
          result.sent++;
        } else {
          result.failed++;
          result.errors.push({
            appointmentId: apt.id,
            error: sendResult.error ?? "Send failed",
          });
        }
      } catch (error) {
        if (error instanceof Error && error.message === "PLAN_LIMIT") {
          result.skipped++;
          continue;
        }
        result.failed++;
        result.errors.push({
          appointmentId: apt.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  },
};
