import { startOfDay, endOfDay } from "date-fns";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { appointmentSchema } from "@/lib/validations/appointment";
import { appointmentService } from "@/server/services/appointment-service";

export async function GET(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status") ?? undefined;

    let from: Date | undefined;
    let to: Date | undefined;
    if (date) {
      const d = new Date(date);
      from = startOfDay(d);
      to = endOfDay(d);
    }

    const appointments = await appointmentService.list(businessId, {
      from,
      to,
      status,
    });
    return jsonOk(appointments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }
    const appointment = await appointmentService.create(businessId, parsed.data);
    return jsonOk(appointment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
