import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { businessUpdateSchema } from "@/lib/validations/business";
import { businessService } from "@/server/services/business-service";

export async function GET() {
  try {
    const businessId = await requireBusinessId();
    const business = await businessService.getById(businessId);
    return jsonOk(business);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = businessUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }
    const business = await businessService.update(businessId, parsed.data);
    return jsonOk(business);
  } catch (error) {
    return handleApiError(error);
  }
}
