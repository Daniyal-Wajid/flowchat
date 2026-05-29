import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { appointmentSchema } from "@/lib/validations/appointment";
import { appointmentService } from "@/server/services/appointment-service";

type Params = { params: Promise<{ id: string }> };

const patchSchema = appointmentSchema.partial();

export async function GET(_request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    const appointment = await appointmentService.getById(businessId, id);
    return jsonOk(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }
    const appointment = await appointmentService.update(businessId, id, parsed.data);
    return jsonOk(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const businessId = await requireBusinessId();
    const { id } = await params;
    await appointmentService.delete(businessId, id);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
