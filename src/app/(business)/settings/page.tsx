import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessSettingsForm } from "@/components/settings/business-settings-form";
import { businessService } from "@/server/services/business-service";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const business = await businessService.getById(session!.user.businessId!);

  return (
    <>
      <Header title="Settings" userEmail={session?.user?.email} />
      <div className="space-y-6 p-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessSettingsForm
              business={{
                name: business.name,
                phone: business.phone,
                timezone: business.timezone,
              }}
            />
            <p className="mt-4 text-xs text-slate-400">Slug: {business.slug}</p>
          </CardContent>
        </Card>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Plan: <Badge>{business.planTier}</Badge>
            </p>
            <p>
              Billing: <Badge variant="secondary">{business.billingStatus}</Badge>
            </p>
            <p>
              Status: <Badge variant="secondary">{business.status}</Badge>
            </p>
            {business.trialEndsAt && (
              <p className="text-slate-500">
                Trial ends: {new Date(business.trialEndsAt).toLocaleDateString()}
              </p>
            )}
            <Link href="/settings/billing" className="text-emerald-600 hover:underline">
              Manage billing →
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
