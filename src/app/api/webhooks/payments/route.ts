import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";
import { subscriptionService } from "@/server/services/subscription-service";
import type { PlanTier } from "@/generated/prisma/client";

const webhookSchema = z.object({
  type: z.string(),
  businessId: z.string(),
  planTier: z.enum(["BASIC", "PRO", "BUSINESS"]).optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  const stripeSignature = request.headers.get("stripe-signature");

  // Flow A: Real Stripe webhook signature verification
  if (stripeSignature) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const bodyText = await request.text();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      const event = stripe.webhooks.constructEvent(
        bodyText,
        stripeSignature,
        webhookSecret
      );

      // Create payment event log in DB
      const dbEvent = await prisma.paymentEvent.create({
        data: {
          eventType: event.type,
          payload: event as any,
          provider: "stripe",
        },
      });

      // Handle checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const businessId = session.metadata?.businessId;
        const planTier = session.metadata?.planTier as PlanTier;

        if (businessId && planTier) {
          // Log business details in payment event
          await prisma.paymentEvent.update({
            where: { id: dbEvent.id },
            data: {
              businessId,
              processedAt: new Date(),
            },
          });

          await subscriptionService.upgradePlan(businessId, planTier);
        }
      }

      return jsonOk({ received: true });
    } catch (err: any) {
      console.error("Stripe Webhook Signature Verification Failed:", err.message);
      return jsonError(`Webhook Error: ${err.message}`, 400);
    }
  }

  // Flow B: Mock/Fallback payments flow (used in local testing / mock mode)
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
    return jsonError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const parsed = webhookSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid payload", 400);
    }

    const { type, businessId, planTier, sessionId } = parsed.data;

    await prisma.paymentEvent.create({
      data: {
        businessId,
        eventType: type,
        payload: body,
        processedAt: new Date(),
        provider: "mock",
      },
    });

    if (type === "checkout.completed" && planTier) {
      await subscriptionService.upgradePlan(businessId, planTier as PlanTier);
    }

    return jsonOk({ received: true, sessionId });
  } catch (error) {
    console.error("Mock Webhook processing error:", error);
    return jsonError("Webhook processing failed", 500);
  }
}
