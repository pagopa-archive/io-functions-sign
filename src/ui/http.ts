import { flow } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { header } from "@pagopa/handler-kit/lib/http";

import { SubscriptionId } from "../signature-request/subscription";

export const requireSubscriptionId = flow(
  header("x-subscription-id"),
  E.fromOption(() => new Error(`Missing X-Subscription-Id header`)),
  E.chain(
    flow(
      SubscriptionId.decode,
      E.mapLeft(() => new Error("Invalid Subscription Id"))
    )
  )
);
