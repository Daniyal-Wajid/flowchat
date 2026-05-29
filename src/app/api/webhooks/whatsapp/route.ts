import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET handler for Meta WhatsApp webhook verification.
 * Meta sends a GET request with a verification token to verify the endpoint is active.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Use the general WEBHOOK_SECRET or a fallback for dev
  const webhookSecret = process.env.WEBHOOK_SECRET || "dev-secret";

  if (mode === "subscribe" && token === webhookSecret) {
    console.log("WhatsApp Webhook verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  console.error("WhatsApp Webhook verification failed. Token mismatch.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST handler to receive inbound customer messages and outbound message status updates.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Ensure it's a WhatsApp business account event
    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ success: false, error: "Invalid payload object" }, { status: 400 });
    }

    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};

        // 1. Process inbound customer messages
        if (value.messages) {
          const messages = value.messages || [];
          for (const msg of messages) {
            const from = msg.from; // e.g. "15551234567"
            const body = msg.text?.body;
            const messageId = msg.id;
            const timestamp = msg.timestamp;

            if (from && body) {
              const cleanFrom = from.replace(/\D/g, "");

              // Look up the customer in the database by phone number.
              // We support matching both with and without the '+' prefix, or ending with the digits.
              const customer = await prisma.customer.findFirst({
                where: {
                  OR: [
                    { phone: cleanFrom },
                    { phone: `+${cleanFrom}` },
                    { phone: { endsWith: cleanFrom } },
                  ],
                },
                include: { business: true },
              });

              if (customer) {
                // Log this inbound message under the customer's business and chat history
                await prisma.messageLog.create({
                  data: {
                    businessId: customer.businessId,
                    customerId: customer.id,
                    direction: "INBOUND",
                    type: "MANUAL",
                    toPhone: customer.phone,
                    body: body,
                    status: "DELIVERED",
                    provider: "meta",
                    externalId: messageId,
                    sentAt: new Date(Number(timestamp) * 1000),
                  },
                });
                console.log(`Successfully logged inbound message from ${customer.name} for business ${customer.business.name}`);
              } else {
                console.log(`Inbound message received from unrecognized number: ${from}`);
              }
            }
          }
        }

        // 2. Process status updates for outbound messages (sent, delivered, read, failed)
        if (value.statuses) {
          const statuses = value.statuses || [];
          for (const statusUpdate of statuses) {
            const externalId = statusUpdate.id;
            const status = statusUpdate.status; // "sent" | "delivered" | "read" | "failed"

            let dbStatus: "SENT" | "DELIVERED" | "FAILED" | "QUEUED" = "SENT";
            if (status === "delivered" || status === "read") {
              dbStatus = "DELIVERED";
            } else if (status === "failed") {
              dbStatus = "FAILED";
            }

            // Find the original message log sent with this external ID
            const originalLog = await prisma.messageLog.findFirst({
              where: { externalId },
            });

            if (originalLog) {
              await prisma.messageLog.update({
                where: { id: originalLog.id },
                data: {
                  status: dbStatus,
                  error: status === "failed" ? (statusUpdate.errors?.[0]?.message || "Delivery failed") : null,
                },
              });
              console.log(`Updated status of message ${externalId} to ${dbStatus}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error handling WhatsApp webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
