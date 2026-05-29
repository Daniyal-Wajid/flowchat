import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { analyticsService } from "@/server/services/analytics-service";
import { PLAN_LIMITS } from "@/lib/plans";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const [stats, business] = await Promise.all([
    analyticsService.getDashboard(businessId, "today"),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);

  const limits = PLAN_LIMITS[business!.planTier];

  return (
    <>
      <Header title="Dashboard" userEmail={session?.user?.email} />
      {business && (
        <TrialBanner trialEndsAt={business.trialEndsAt} planTier={business.planTier} />
      )}
      <div className="flex-1 space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Today" value={stats.appointmentsToday} subtitle="appointments" />
          <StatCard title="This week" value={stats.appointmentsWeek} subtitle="appointments" />
          <StatCard title="Customers" value={stats.customersTotal} subtitle="total" />
          <StatCard
            title="Messages"
            value={`${stats.usage.messagesSent}/${limits.messagesPerMonth}`}
            subtitle="this month"
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming appointments</CardTitle>
            <Link href="/appointments/new" className="text-sm text-emerald-600 hover:underline">
              + New appointment
            </Link>
          </CardHeader>
          <CardContent>
            {stats.upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.upcoming.map((apt) => (
                  <li key={apt.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{apt.title}</p>
                      <p className="text-sm text-slate-500">{apt.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{format(apt.scheduledAt, "MMM d, h:mm a")}</p>
                      <Badge variant="secondary">{apt.status}</Badge>
                    </div>
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

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
