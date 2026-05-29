"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Appointment = {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  notes?: string | null;
  customer: { name: string; phone: string };
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then((r) => r.json())
      .then(setAppointment)
      .catch(() => {});
  }, [id]);

  async function sendConfirmation() {
    setSending(true);
    setMessage("");
    const res = await fetch("/api/messages/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    setSending(false);
    if (res.ok) {
      setMessage("Confirmation sent!");
      const updated = await fetch(`/api/appointments/${id}`).then((r) => r.json());
      setAppointment(updated);
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Failed to send");
    }
  }

  if (!appointment) {
    return (
      <>
        <Header title="Appointment" />
        <div className="p-8 text-slate-500">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header title={appointment.title} />
      <div className="space-y-6 p-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Details
              <Badge variant="secondary">{appointment.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Customer:</span> {appointment.customer.name} (
              {appointment.customer.phone})
            </p>
            <p>
              <span className="text-slate-500">When:</span>{" "}
              {format(new Date(appointment.scheduledAt), "MMM d, yyyy h:mm a")}
            </p>
            {appointment.notes && (
              <p>
                <span className="text-slate-500">Notes:</span> {appointment.notes}
              </p>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={sendConfirmation} disabled={sending}>
                {sending ? "Sending..." : "Send WhatsApp confirmation"}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/appointments">Back</Link>
              </Button>
            </div>
            {message && <p className="text-emerald-600">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
