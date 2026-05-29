import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LIMITS, PLAN_PRICES } from "@/lib/plans";

const tiers = ["BASIC", "PRO", "BUSINESS"] as const;

export default function AdminPlansPage() {
  return (
    <>
      <Header title="Subscription plans" />
      <div className="grid gap-4 p-8 md:grid-cols-3">
        {tiers.map((tier) => {
          const limits = PLAN_LIMITS[tier];
          return (
            <Card key={tier}>
              <CardHeader>
                <CardTitle>{tier}</CardTitle>
                <p className="text-2xl font-bold">${PLAN_PRICES[tier]}/mo</p>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <p>{limits.messagesPerMonth} messages/month</p>
                <p>{limits.maxStaff} staff</p>
                <p>
                  {limits.maxCustomers >= 999999
                    ? "Unlimited customers"
                    : `${limits.maxCustomers} customers`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
