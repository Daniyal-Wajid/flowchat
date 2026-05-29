import { prisma } from "@/lib/db";
import type { IMessagingProvider, SendMessageInput, SendMessageResult } from "./types";

export class MockMessagingProvider implements IMessagingProvider {
  readonly name = "mock";

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    const externalId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await prisma.messageLog.create({
      data: {
        businessId: input.businessId,
        customerId: input.customerId,
        appointmentId: input.appointmentId,
        type: input.type,
        toPhone: input.toPhone,
        body: input.body,
        status: "SENT",
        provider: this.name,
        externalId,
        sentAt: new Date(),
        direction: "OUTBOUND",
      },
    });

    return { success: true, externalId };
  }
}
