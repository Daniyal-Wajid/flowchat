"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Business = {
  id: string;
  name: string;
  slug: string;
  status: string;
  planTier: string;
  billingStatus: string;
  _count: { customers: number; appointments: number; messageLogs: number };
  users: { email: string; name: string | null; role: string }[];
};

export default function AdminBusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [message, setMessage] = useState("");

  function load() {
    fetch(`/api/admin/businesses/${id}`)
      .then((r) => r.json())
      .then(setBusiness);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function patch(data: Record<string, string>) {
    const res = await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setMessage("Updated!");
      load();
    }
  }

  if (!business) {
    return (
      <>
        <Header title="Business" />
        <div className="p-8 text-slate-500">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header title={business.name} />
      <div className="space-y-6 p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {business.name}
              <Badge>{business.planTier}</Badge>
              <Badge variant="secondary">{business.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Slug: {business.slug}</p>
            <p>Billing: {business.billingStatus}</p>
            <p>
              Usage: {business._count.customers} customers, {business._count.appointments}{" "}
              appointments, {business._count.messageLogs} messages
            </p>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => patch({ status: "ACTIVE" })}>
                Activate
              </Button>
              <Button size="sm" variant="destructive" onClick={() => patch({ status: "SUSPENDED" })}>
                Suspend
              </Button>
              <Button size="sm" variant="outline" onClick={() => patch({ planTier: "PRO" })}>
                Set Pro
              </Button>
              <Button size="sm" variant="outline" onClick={() => patch({ planTier: "BUSINESS" })}>
                Set Business
              </Button>
            </div>

            {message && <p className="text-emerald-600">{message}</p>}

            <div>
              <p className="mb-2 font-medium">Users</p>
              <ul className="text-slate-600">
                {business.users.map((u) => (
                  <li key={u.email}>
                    {u.name ?? u.email} — {u.role}
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild variant="ghost">
              <Link href="/admin/businesses">← Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
