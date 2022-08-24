import { agent } from "@pagopa/ts-commons";
import {
  AbortableFetch,
  setFetchTimeout,
  toFetch,
} from "@pagopa/ts-commons/lib/fetch";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import { createClient } from "@pagopa/io-functions-services-sdk/client";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { config } from "../../app/config";

const httpApiFetch = agent.getHttpFetch(process.env);
const abortableFetch = AbortableFetch(httpApiFetch);

export const ioApiClient = pipe(
  config,
  E.map((config) =>
    createClient<"SubscriptionKey">({
      baseUrl: config.ioapi.serviceBasePath,
      fetchApi: toFetch(
        setFetchTimeout(
          config.ioapi.serviceRequestTimeout as Millisecond,
          abortableFetch
        )
      ) as unknown as typeof fetch,
      withDefaults: (op) => (params) =>
        op({
          ...params,
          SubscriptionKey: config.ioapi.serviceSubscriptionKey,
        }),
    })
  )
);
