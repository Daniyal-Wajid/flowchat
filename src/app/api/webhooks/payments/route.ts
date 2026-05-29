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
      },
    });

    if (type === "checkout.completed" && planTier) {
      await subscriptionService.upgradePlan(businessId, planTier as PlanTier);
    }

    return jsonOk({ received: true, sessionId });
  } catch (error) {
    console.error("Webhook error:", error);
    return jsonError("Webhook processing failed", 500);
  }
}
