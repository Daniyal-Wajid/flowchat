import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { analyticsService } from "@/server/services/analytics-service";

export async function GET(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") === "week" ? "week" : "today";
    const data = await analyticsService.getDashboard(businessId, range);
    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}
