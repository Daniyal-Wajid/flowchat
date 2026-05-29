import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerService } from "@/server/services/customer-service";

export default async function CustomersPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const customers = await customerService.list(businessId);

  return (
    <>
      <Header title="Customers" userEmail={session?.user?.email} />
      <div className="p-8">
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href="/customers/new">Add customer</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="text-sm text-slate-500">No customers yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Phone</th>
                    <th className="pb-2">Appointments</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3">{c.phone}</td>
                      <td className="py-3">{c._count.appointments}</td>
                      <td className="py-3 text-right">
                        <Link href={`/customers/${c.id}`} className="text-emerald-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
