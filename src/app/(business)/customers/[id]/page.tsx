import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendMessageForm } from "@/components/customers/send-message-form";
import { customerService } from "@/server/services/customer-service";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const { id } = await params;

  let customer;
  try {
    customer = await customerService.getById(businessId, id);
  } catch {
    notFound();
  }

  return (
    <>
      <Header title={customer.name} userEmail={session?.user?.email} />
      <div className="space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Phone: {customer.phone}</p>
            {customer.email && <p>Email: {customer.email}</p>}
            {customer.notes && <p>Notes: {customer.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send WhatsApp message</CardTitle>
          </CardHeader>
          <CardContent>
            <SendMessageForm customerId={customer.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent appointments</CardTitle>
            <Link
              href={`/appointments/new?customerId=${customer.id}`}
              className="text-sm text-emerald-600 hover:underline"
            >
              + Book appointment
            </Link>
          </CardHeader>
          <CardContent>
            {customer.appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No appointments yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {customer.appointments.map((apt) => (
                  <li key={apt.id} className="flex justify-between py-2">
                    <Link href={`/appointments/${apt.id}`} className="font-medium hover:underline">
                      {apt.title}
                    </Link>
                    <span className="text-slate-500">
                      {format(apt.scheduledAt, "MMM d, yyyy h:mm a")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
