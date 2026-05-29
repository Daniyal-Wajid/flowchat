import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentService } from "@/server/services/appointment-service";

export default async function AppointmentsPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const appointments = await appointmentService.list(businessId);

  return (
    <>
      <Header title="Appointments" userEmail={session?.user?.email} />
      <div className="p-8">
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href="/appointments/new">New appointment</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All appointments ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No appointments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">When</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-slate-50">
                      <td className="py-3 font-medium">{apt.title}</td>
                      <td className="py-3">{apt.customer.name}</td>
                      <td className="py-3">{format(apt.scheduledAt, "MMM d, yyyy h:mm a")}</td>
                      <td className="py-3">
                        <Badge variant="secondary">{apt.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/appointments/${apt.id}`} className="text-emerald-600 hover:underline">
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
