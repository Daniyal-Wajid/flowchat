import { prisma } from "@/lib/db";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/tenant";

export async function GET() {
  try {
    await requireSuperAdmin();

    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            appointments: true,
            messageLogs: true,
          },
        },
        subscription: true,
      },
    });

    return jsonOk(businesses);
  } catch (error) {
    return handleApiError(error);
  }
}
