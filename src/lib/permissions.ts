import type { UserRole } from "@/generated/prisma/client";

export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageBilling(role: UserRole): boolean {
  return role === "OWNER" || role === "SUPER_ADMIN";
}

export function canManageTeam(role: UserRole): boolean {
  return role === "OWNER";
}
