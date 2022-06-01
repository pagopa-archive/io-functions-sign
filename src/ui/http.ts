import { flow } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { header } from "@pagopa/handler-kit/lib/http";

import { SubscriptionId } from "../signature-request/subscription";

export const requireSubscriptionId = flow(
  header("x-io-subscription-id"),
  E.fromOption(
    () => new Error(`missing required "x-io-subscription-id" header`)
  ),
  E.chain(
    flow(
      SubscriptionId.decode,
      E.mapLeft(() => new Error("invalid subscription id"))
    )
  )
);
