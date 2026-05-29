import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/tenant";
import { subscriptionService } from "@/server/services/subscription-service";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL"]).optional(),
  planTier: z.enum(["BASIC", "PRO", "BUSINESS"]).optional(),
  billingStatus: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"]).optional(),
});

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        subscription: true,
        users: { select: { id: true, email: true, name: true, role: true } },
        usageCounters: { orderBy: { periodStart: "desc" }, take: 3 },
        _count: {
          select: { customers: true, appointments: true, messageLogs: true },
        },
      },
    });

    if (!business) throw new Error("NOT_FOUND");
    return jsonOk(business);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error("Invalid input"));
    }

    if (parsed.data.planTier) {
      await subscriptionService.upgradePlan(id, parsed.data.planTier);
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.billingStatus
          ? { billingStatus: parsed.data.billingStatus }
          : {}),
      },
      include: { subscription: true },
    });

    return jsonOk(business);
  } catch (error) {
    return handleApiError(error);
  }
}
