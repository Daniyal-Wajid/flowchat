import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { customerSchema } from "@/lib/validations/customer";
import { customerService } from "@/server/services/customer-service";

export async function GET(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const customers = await customerService.list(businessId, search);
    return jsonOk(customers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }
    const customer = await customerService.create(businessId, parsed.data);
    return jsonOk(customer, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
