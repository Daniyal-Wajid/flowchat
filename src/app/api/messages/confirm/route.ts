import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { whatsAppService } from "@/lib/messaging/service";

const schema = z.object({ appointmentId: z.string() });

export async function POST(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error("Invalid input"));
    }

    const result = await whatsAppService.sendConfirmation(
      parsed.data.appointmentId,
      businessId
    );
    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
