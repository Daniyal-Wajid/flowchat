import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminBusinessesPage() {
  const session = await auth();

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, customers: true, messageLogs: true } },
    },
  });

  return (
    <>
      <Header title="All businesses" userEmail={session?.user?.email} />
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Tenants ({businesses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Customers</th>
                  <th className="pb-2">Messages</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{b.name}</td>
                    <td className="py-3">
                      <Badge>{b.planTier}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={b.status === "ACTIVE" ? "default" : "warning"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3">{b._count.customers}</td>
                    <td className="py-3">{b._count.messageLogs}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/businesses/${b.id}`} className="text-emerald-600 hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
