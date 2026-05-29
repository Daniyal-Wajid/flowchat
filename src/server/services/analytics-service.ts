import { endOfDay, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { subscriptionService } from "./subscription-service";

export const analyticsService = {
  async getDashboard(businessId: string, range: "today" | "week" = "today") {
    const now = new Date();
    const from =
      range === "today" ? startOfDay(now) : startOfDay(subDays(now, 7));
    const to = endOfDay(now);

    const [appointmentsToday, appointmentsWeek, messagesInRange, customersTotal, usage, upcoming] =
      await Promise.all([
        prisma.appointment.count({
          where: {
            businessId,
            scheduledAt: { gte: startOfDay(now), lte: endOfDay(now) },
          },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            scheduledAt: { gte: startOfDay(subDays(now, 7)), lte: endOfDay(now) },
          },
        }),
        prisma.messageLog.count({
          where: { businessId, createdAt: { gte: from, lte: to } },
        }),
        prisma.customer.count({ where: { businessId } }),
        subscriptionService.getUsage(businessId),
        prisma.appointment.findMany({
          where: {
            businessId,
            scheduledAt: { gte: now },
            status: { in: ["SCHEDULED", "CONFIRMED"] },
          },
          include: { customer: true },
          orderBy: { scheduledAt: "asc" },
          take: 5,
        }),
      ]);

    return {
      appointmentsToday,
      appointmentsWeek,
      messagesInRange,
      customersTotal,
      usage,
      upcoming,
    };
  },
};
