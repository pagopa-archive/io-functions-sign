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
import { config } from "../../app/config";

export const basePath = pipe(
  config,
  E.chain((config) =>
    pipe(
      config.service.serviceBasePath,
      UrlFromString.decode,
      E.mapLeft(() => new Error("Invalid service parameters"))
    )
  )
);

export const headers = pipe(
  config,
  E.map((config) => ({
    "content-type": "application/json",
    "Ocp-Apim-Subscription-Key": config.service.serviceSubscriptionKey,
  }))
);

const httpApiFetch = agent.getHttpFetch(process.env);
const abortableFetch = AbortableFetch(httpApiFetch);

export const timeoutFetch = pipe(
  config,
  E.map((config) =>
    toFetch(
      setFetchTimeout(
        config.service.serviceRequestTimeout as Millisecond,
        abortableFetch
      )
    )
  )
);
