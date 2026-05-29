"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_PRICES } from "@/lib/plans";

const plans = ["BASIC", "PRO", "BUSINESS"] as const;

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const plan = searchParams.get("plan") as (typeof plans)[number] | null;
    if (searchParams.get("success") === "1" && plan && plans.includes(plan)) {
      fetch("/api/billing/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier: plan }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.planTier) {
            setNotice(`Upgraded to ${data.planTier}!`);
            router.replace("/settings/billing");
          }
        })
        .catch(() => {});
    }
  }, [searchParams, router]);

  async function upgrade(planTier: (typeof plans)[number]) {
    setLoading(planTier);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planTier }),
    });
    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <>
      <Header title="Billing" />
      <div className="p-8">
        {notice && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{notice}</p>}
        <p className="mb-6 text-sm text-slate-500">
          MVP uses mock checkout — upgrade applies instantly after redirect.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan}>
              <CardHeader>
                <CardTitle>{plan}</CardTitle>
                <p className="text-2xl font-bold">${PLAN_PRICES[plan]}/mo</p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => upgrade(plan)}
                  disabled={loading === plan}
                  className="w-full"
                >
                  {loading === plan ? "Processing..." : `Upgrade to ${plan}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
