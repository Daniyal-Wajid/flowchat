import { signupSchema } from "@/lib/validations/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { signupService } from "@/server/services/signup-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const user = await signupService.register(parsed.data);
    return jsonOk({ userId: user.id, email: user.email }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return jsonError("Email already registered", 409);
    }
    return handleApiError(error);
  }
}
