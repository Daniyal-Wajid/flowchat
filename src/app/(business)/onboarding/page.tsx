"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Dubai",
  "Asia/Kolkata",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const businessRes = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.get("phone") || null,
        timezone: form.get("timezone"),
      }),
    });

    if (!businessRes.ok) {
      setError("Failed to save business profile");
      setLoading(false);
      return;
    }

    const customerName = form.get("customerName") as string;
    const customerPhone = form.get("customerPhone") as string;

    if (customerName && customerPhone) {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName, phone: customerPhone }),
      }).catch(() => {});
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome! Quick setup</CardTitle>
          <p className="text-sm text-slate-500">
            Set your business phone and timezone. Add your first customer if you like.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Business WhatsApp number</Label>
              <Input id="phone" name="phone" placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue="UTC"
                className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <hr className="border-slate-100" />
            <p className="text-sm font-medium text-slate-700">First customer (optional)</p>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer phone</Label>
              <Input id="customerPhone" name="customerPhone" placeholder="+1234567890" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Finish setup"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
                Skip
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
