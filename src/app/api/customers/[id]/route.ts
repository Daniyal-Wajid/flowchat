import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { customerSchema } from "@/lib/validations/customer";
import { customerService } from "@/server/services/customer-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    const customer = await customerService.getById(businessId, id);
    return jsonOk(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }
    const customer = await customerService.update(businessId, id, parsed.data);
    return jsonOk(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    await customerService.delete(businessId, id);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
