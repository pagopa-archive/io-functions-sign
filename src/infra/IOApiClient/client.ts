import { agent } from "@pagopa/ts-commons";
import {
  AbortableFetch,
  setFetchTimeout,
  toFetch,
} from "@pagopa/ts-commons/lib/fetch";

import * as E from "fp-ts/lib/Either";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe } from "fp-ts/lib/function";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { config } from "../../app/config";

export const basePath = pipe(
  config,
  E.chainW((config) =>
    pipe(
      config.ioapi.serviceBasePath,
      validate(UrlFromString, "Invalid service parameters")
    )
  )
);

export const headers = pipe(
  config,
  E.map((config) => ({
    "content-type": "application/json",
    "Ocp-Apim-Subscription-Key": config.ioapi.serviceSubscriptionKey,
  }))
);

const httpApiFetch = agent.getHttpFetch(process.env);
const abortableFetch = AbortableFetch(httpApiFetch);

export const timeoutFetch = pipe(
  config,
  E.map((config) =>
    toFetch(
      setFetchTimeout(
        config.ioapi.serviceRequestTimeout as Millisecond,
        abortableFetch
      )
    )
  )
);
