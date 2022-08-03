import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import { createClient } from "@pagopa/io-functions-services-sdk/client";
import nodeFetch from "node-fetch";
import { config } from "../../app/config";

export const ioApiClient = pipe(
  config,
  E.map((config) =>
    createClient<"SubscriptionKey">({
      baseUrl: config.ioapi.serviceBasePath,
      fetchApi: nodeFetch as unknown as typeof fetch,
      withDefaults: (op) => (params) =>
        op({
          ...params,
          // please refer to source api spec for actual header mapping
          // https://github.com/pagopa/io-functions-app/blob/master/openapi/index.yaml#:~:text=%20%20SubscriptionKey:
          SubscriptionKey: config.ioapi.serviceSubscriptionKey,
        }),
    })
  )
);
