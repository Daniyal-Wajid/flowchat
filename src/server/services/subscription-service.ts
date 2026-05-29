import { startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";
import type { PlanTier } from "@/generated/prisma/client";

function periodStart(date = new Date()) {
  return startOfMonth(date);
}

export const subscriptionService = {
  async getUsage(businessId: string) {
    const start = periodStart();
    const counter = await prisma.usageCounter.findUnique({
      where: { businessId_periodStart: { businessId, periodStart: start } },
    });
    return counter ?? { messagesSent: 0, appointmentsCreated: 0 };
  },

  async incrementMessageCount(businessId: string) {
    const start = periodStart();
    await prisma.usageCounter.upsert({
      where: { businessId_periodStart: { businessId, periodStart: start } },
      create: { businessId, periodStart: start, messagesSent: 1 },
      update: { messagesSent: { increment: 1 } },
    });
  },

  async incrementAppointmentCount(businessId: string) {
    const start = periodStart();
    await prisma.usageCounter.upsert({
      where: { businessId_periodStart: { businessId, periodStart: start } },
      create: { businessId, periodStart: start, appointmentsCreated: 1 },
      update: { appointmentsCreated: { increment: 1 } },
    });
  },

  async assertCanSendMessage(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new Error("NOT_FOUND");
    if (business.billingStatus === "CANCELED" || business.status === "SUSPENDED") {
      throw new Error("FORBIDDEN");
    }

    const limits = PLAN_LIMITS[business.planTier];
    const usage = await this.getUsage(businessId);
    if (usage.messagesSent >= limits.messagesPerMonth) {
      throw new Error("PLAN_LIMIT");
    }
  },

  async assertCanAddCustomer(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new Error("NOT_FOUND");

    const limits = PLAN_LIMITS[business.planTier];
    const count = await prisma.customer.count({ where: { businessId } });
    if (count >= limits.maxCustomers) {
      throw new Error("PLAN_LIMIT");
    }
  },

  async upgradePlan(businessId: string, planTier: PlanTier) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.$transaction([
      prisma.business.update({
        where: { id: businessId },
        data: {
          planTier,
          billingStatus: "ACTIVE",
          status: "ACTIVE",
        },
      }),
      prisma.subscription.upsert({
        where: { businessId },
        create: {
          businessId,
          planTier,
          billingStatus: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        update: {
          planTier,
          billingStatus: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      }),
    ]);
  },
};
