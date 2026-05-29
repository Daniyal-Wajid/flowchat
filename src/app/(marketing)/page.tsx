import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Automate appointments & WhatsApp for your business
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Manage customers, bookings, and send confirmations & reminders via WhatsApp —
          all in one simple dashboard.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Start 14-day free trial</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>

      <div className="mt-24 grid gap-8 md:grid-cols-3">
        {[
          {
            title: "Appointments & orders",
            desc: "Create, track, and update bookings from one place.",
          },
          {
            title: "Customer CRM",
            desc: "Store contacts with phone numbers ready for WhatsApp.",
          },
          {
            title: "WhatsApp automation",
            desc: "Send confirmations and reminders automatically.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
