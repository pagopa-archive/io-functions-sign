import { flow } from "fp-ts/function";
import * as E from "fp-ts/Either";
import {
  header,
  errorResponse as httpErrorResponse,
} from "@pagopa/handler-kit/lib/http";

import {
  ForbiddenError,
  NotFoundError,
} from "@pagopa/handler-kit/lib/http/errors";
import { SubscriptionId } from "../signature-request/subscription";

export const requireSubscriptionId = flow(
  header("x-subscription-id"),
  E.fromOption(() => new ForbiddenError(`Missing X-Subscription-Id header`)),
  E.chain(
    flow(
      SubscriptionId.decode,
      E.mapLeft(() => new ForbiddenError("Invalid Subscription Id"))
    )
  )
);

const tryToHttpResponse = (e: Error) => {
  if (e.name === "ProductNotFoundError") {
    return new NotFoundError(e.message);
  }
  return e;
};

export const errorResponse = flow(tryToHttpResponse, httpErrorResponse);
