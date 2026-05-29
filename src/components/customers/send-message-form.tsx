"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SendMessageForm({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        message: form.get("message"),
      }),
    });

    setLoading(false);
    if (res.ok) {
      setFeedback("Message sent (logged in mock mode).");
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      setFeedback(data.error ?? "Failed to send");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="message">WhatsApp message</Label>
        <Input
          id="message"
          name="message"
          placeholder="Your order is ready for pickup"
          required
          maxLength={1000}
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Sending..." : "Send message"}
      </Button>
      {feedback && (
        <p className={`text-sm ${feedback.includes("sent") ? "text-emerald-600" : "text-red-600"}`}>
          {feedback}
        </p>
      )}
    </form>
  );
}
