import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHORIZED":
        return jsonError("Unauthorized", 401);
      case "FORBIDDEN":
        return jsonError("Forbidden", 403);
      case "NO_BUSINESS":
        return jsonError("No business associated with account", 403);
      case "NOT_FOUND":
        return jsonError("Not found", 404);
      case "PLAN_LIMIT":
        return jsonError("Plan limit reached", 403, "PLAN_LIMIT");
      default:
        console.error(error);
        return jsonError(error.message || "Internal server error", 500);
    }
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
