import { flow } from "fp-ts/function";
import * as E from "fp-ts/Either";

import { header } from "@pagopa/handler-kit/lib/http";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { SubscriptionId } from "../signature-request/subscription";

export const requireSubscriptionId = flow(
  header("x-subscription-id"),
  E.fromOption(() => new Error(`Missing X-Subscription-Id header`)),
  E.chainW(validate(SubscriptionId, "Invalid SubscriptionId"))
);
