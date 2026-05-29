import type { IMessagingProvider } from "./types";
import { MockMessagingProvider } from "./mock-provider";
import { MetaMessagingProvider } from "./meta-provider";

export function getMessagingProvider(): IMessagingProvider {
  const name = process.env.MESSAGING_PROVIDER ?? "mock";

  switch (name) {
    case "meta":
      return new MetaMessagingProvider();
    case "mock":
    default:
      return new MockMessagingProvider();
  }
}
