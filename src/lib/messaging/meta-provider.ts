import type { IMessagingProvider, SendMessageInput, SendMessageResult } from "./types";

/**
 * Phase 2: Meta WhatsApp Cloud API provider.
 *
 * Required env:
 * - META_WHATSAPP_TOKEN
 * - META_PHONE_NUMBER_ID
 * - META_WHATSAPP_API_VERSION (optional, default v21.0)
 */
export class MetaMessagingProvider implements IMessagingProvider {
  readonly name = "meta";

  private getConfig() {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      throw new Error(
        "Meta WhatsApp not configured. Set META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID."
      );
    }
    return {
      token,
      phoneNumberId,
      apiVersion: process.env.META_WHATSAPP_API_VERSION ?? "v21.0",
    };
  }

  async send(input: SendMessageInput): Promise<SendMessageResult> {
    const { token, phoneNumberId, apiVersion } = this.getConfig();

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.toPhone.replace(/\D/g, ""),
        type: "text",
        text: { body: input.body },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message ?? "Meta API request failed",
      };
    }

    return {
      success: true,
      externalId: data.messages?.[0]?.id,
    };
  }
}
