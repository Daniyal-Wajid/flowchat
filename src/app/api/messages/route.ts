import { prisma } from "@/lib/db";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";

export async function GET(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    const messages = await prisma.messageLog.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    });

    return jsonOk(messages);
  } catch (error) {
    return handleApiError(error);
  }
}
