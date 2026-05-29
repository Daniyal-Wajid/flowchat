import { z } from "zod";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireBusinessId } from "@/lib/tenant";
import { whatsAppService } from "@/lib/messaging/service";

const sendSchema = z.object({
  customerId: z.string(),
  message: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  try {
    const businessId = await requireBusinessId();
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return handleApiError(new Error(parsed.error.issues[0]?.message ?? "Invalid input"));
    }

    const result = await whatsAppService.sendManual({
      businessId,
      customerId: parsed.data.customerId,
      message: parsed.data.message,
    });

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
