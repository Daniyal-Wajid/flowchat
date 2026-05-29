import type { PlanTier } from "@/generated/prisma/client";

export const PLAN_LIMITS: Record<
  PlanTier,
  { messagesPerMonth: number; maxStaff: number; maxCustomers: number }
> = {
  BASIC: { messagesPerMonth: 200, maxStaff: 1, maxCustomers: 500 },
  PRO: { messagesPerMonth: 2000, maxStaff: 3, maxCustomers: 5000 },
  BUSINESS: { messagesPerMonth: 10000, maxStaff: 10, maxCustomers: 999999 },
};

export const PLAN_PRICES: Record<PlanTier, number> = {
  BASIC: 19,
  PRO: 49,
  BUSINESS: 99,
};

export function getPlanLabel(tier: PlanTier): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}
