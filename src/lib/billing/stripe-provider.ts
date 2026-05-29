import type { PlanTier } from "@/generated/prisma/client";
import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  IBillingProvider,
} from "./types";

/**
 * Phase 2: Stripe Checkout for subscriptions.
 *
 * Required env:
 * - STRIPE_SECRET_KEY
 * - STRIPE_PRICE_BASIC / STRIPE_PRICE_PRO / STRIPE_PRICE_BUSINESS
 * - STRIPE_WEBHOOK_SECRET (for /api/webhooks/payments)
 */
export class StripeBillingProvider implements IBillingProvider {
  readonly name = "stripe";

  private assertConfigured() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "Stripe not configured. Set STRIPE_SECRET_KEY and price IDs, then npm install stripe."
      );
    }
  }

  async createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult> {
    this.assertConfigured();

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const priceId = this.getPriceId(input.planTier);
    
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { businessId: input.businessId, planTier: input.planTier },
    });
    
    return { sessionId: session.id, url: session.url! };
  }

  private getPriceId(planTier: PlanTier): string {
    const map = {
      BASIC: process.env.STRIPE_PRICE_BASIC!,
      PRO: process.env.STRIPE_PRICE_PRO!,
      BUSINESS: process.env.STRIPE_PRICE_BUSINESS!,
    };
    return map[planTier];
  }
}
