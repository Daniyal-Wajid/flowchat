import type { PlanTier } from "@/generated/prisma/client";

export interface CheckoutSessionInput {
  businessId: string;
  planTier: PlanTier;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface IBillingProvider {
  readonly name: string;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
}

export type PaymentWebhookEvent = {
  type: string;
  businessId: string;
  planTier?: PlanTier;
  sessionId?: string;
};
