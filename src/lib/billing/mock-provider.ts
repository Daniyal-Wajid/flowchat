import type {
  CheckoutSessionInput,
  CheckoutSessionResult,
  IBillingProvider,
} from "./types";

export class MockBillingProvider implements IBillingProvider {
  readonly name = "mock";

  async createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult> {
    const sessionId = `mock_cs_${input.businessId}_${input.planTier}_${Date.now()}`;
    const separator = input.successUrl.includes("?") ? "&" : "?";
    const url = `${input.successUrl}${separator}session_id=${sessionId}&plan=${input.planTier}`;
    return { sessionId, url };
  }
}
