import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { prisma } from "@/lib/db";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { id: session.user.businessId },
  });

  if (!business) redirect("/login");
  if (business.status === "SUSPENDED") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Your account has been suspended. Contact support.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar variant="business" />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
