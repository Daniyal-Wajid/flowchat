import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { canManageBilling } from "@/lib/permissions";
import { requireSession } from "@/lib/tenant";
import { getBillingProvider } from "@/lib/billing";
import type { PlanTier } from "@/generated/prisma/client";

const schema = z.object({
  planTier: z.enum(["BASIC", "PRO", "BUSINESS"]),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageBilling(session.user.role as never)) {
      return jsonError("Only owners can manage billing", 403);
    }

    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid plan", 400);
    }

    const provider = getBillingProvider();
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const checkout = await provider.createCheckoutSession({
      businessId,
      planTier: parsed.data.planTier as PlanTier,
      successUrl: `${baseUrl}/settings/billing?success=1`,
      cancelUrl: `${baseUrl}/settings/billing?canceled=1`,
    });

    await prisma.paymentEvent.create({
      data: {
        businessId,
        provider: provider.name,
        eventType: "checkout.created",
        payload: { sessionId: checkout.sessionId, planTier: parsed.data.planTier },
      },
    });

    return jsonOk(checkout);
  } catch (error) {
    return handleApiError(error);
  }
}
