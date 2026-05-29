import { z } from "zod";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { canManageBilling } from "@/lib/permissions";
import { requireSession } from "@/lib/tenant";
import { subscriptionService } from "@/server/services/subscription-service";
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

    await subscriptionService.upgradePlan(businessId, parsed.data.planTier as PlanTier);
    return jsonOk({ success: true, planTier: parsed.data.planTier });
  } catch (error) {
    return handleApiError(error);
  }
}
