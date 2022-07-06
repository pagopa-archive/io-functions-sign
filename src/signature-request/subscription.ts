import * as t from "io-ts";

export const SubscriptionId = t.string;

export const Subscription = t.type({
  id: SubscriptionId,
});

export type Subscription = t.TypeOf<typeof Subscription>;
