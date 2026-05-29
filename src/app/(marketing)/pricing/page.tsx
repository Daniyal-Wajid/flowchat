import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LIMITS, PLAN_PRICES } from "@/lib/plans";

const plans = [
  { tier: "BASIC" as const, highlight: false },
  { tier: "PRO" as const, highlight: true },
  { tier: "BUSINESS" as const, highlight: false },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold">Simple pricing</h1>
      <p className="mt-2 text-center text-slate-600">Monthly plans. Upgrade anytime.</p>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map(({ tier, highlight }) => {
          const limits = PLAN_LIMITS[tier];
          return (
            <Card
              key={tier}
              className={highlight ? "border-emerald-500 ring-2 ring-emerald-500" : ""}
            >
              <CardHeader>
                <CardTitle>{tier}</CardTitle>
                <p className="text-3xl font-bold">${PLAN_PRICES[tier]}<span className="text-sm font-normal text-slate-500">/mo</span></p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>{limits.messagesPerMonth.toLocaleString()} WhatsApp messages/mo</p>
                <p>Up to {limits.maxStaff} staff</p>
                <p>
                  {limits.maxCustomers >= 999999
                    ? "Unlimited customers"
                    : `${limits.maxCustomers.toLocaleString()} customers`}
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/signup">Get started</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
