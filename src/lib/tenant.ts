import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import type { Session } from "next-auth";

export type TenantSession = Session & {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    businessId: string | null;
  };
};

export async function getSession(): Promise<TenantSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as TenantSession;
}

export async function requireSession(): Promise<TenantSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireBusinessId(): Promise<string> {
  const session = await requireSession();
  if (!session.user.businessId) {
    throw new Error("NO_BUSINESS");
  }
  return session.user.businessId;
}

export async function requireSuperAdmin(): Promise<TenantSession> {
  const session = await requireSession();
  if (!isSuperAdmin(session.user.role as "SUPER_ADMIN" | "OWNER" | "STAFF")) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function assertResourceBelongsToBusiness(
  resourceBusinessId: string,
  sessionBusinessId: string
) {
  if (resourceBusinessId !== sessionBusinessId) {
    throw new Error("FORBIDDEN");
  }
}
