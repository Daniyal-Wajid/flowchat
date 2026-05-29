import type { MessageType } from "@/generated/prisma/client";

export interface SendMessageInput {
  businessId: string;
  toPhone: string;
  body: string;
  type: MessageType;
  customerId?: string;
  appointmentId?: string;
}

export interface SendMessageResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface IMessagingProvider {
  readonly name: string;
  send(input: SendMessageInput): Promise<SendMessageResult>;
}
