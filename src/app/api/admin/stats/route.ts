import { prisma } from "@/lib/db";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/tenant";

export async function GET() {
  try {
    await requireSuperAdmin();

    const [businesses, activeBusinesses, messages, appointments, customers] =
      await Promise.all([
        prisma.business.count(),
        prisma.business.count({ where: { status: "ACTIVE" } }),
        prisma.messageLog.count(),
        prisma.appointment.count(),
        prisma.customer.count(),
      ]);

    const byPlan = await prisma.business.groupBy({
      by: ["planTier"],
      _count: true,
    });

    return jsonOk({
      businesses,
      activeBusinesses,
      messages,
      appointments,
      customers,
      byPlan,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
