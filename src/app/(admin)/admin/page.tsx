import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [businesses, activeBusinesses, messages, appointments] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: "ACTIVE" } }),
    prisma.messageLog.count(),
    prisma.appointment.count(),
  ]);

  return (
    <>
      <Header title="Platform overview" userEmail={session?.user?.email} />
      <div className="grid gap-4 p-8 md:grid-cols-4">
        <StatCard title="Businesses" value={businesses} />
        <StatCard title="Active" value={activeBusinesses} />
        <StatCard title="Messages sent" value={messages} />
        <StatCard title="Appointments" value={appointments} />
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <CardTitle className="text-sm font-normal text-slate-500">{title}</CardTitle>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
