import type { IBillingProvider } from "./types";
import { MockBillingProvider } from "./mock-provider";
import { StripeBillingProvider } from "./stripe-provider";

export function getBillingProvider(): IBillingProvider {
  const name = process.env.BILLING_PROVIDER ?? "mock";

  switch (name) {
    case "stripe":
      return new StripeBillingProvider();
    case "mock":
    default:
      return new MockBillingProvider();
  }
}
