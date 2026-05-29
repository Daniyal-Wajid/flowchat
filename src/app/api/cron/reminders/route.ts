import { jsonOk, jsonError } from "@/lib/api";
import { reminderService } from "@/server/services/reminder-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return jsonError("CRON_SECRET not configured", 500);
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return jsonError("Unauthorized", 401);
  }

  const result = await reminderService.runDueReminders();
  return jsonOk(result);
}
