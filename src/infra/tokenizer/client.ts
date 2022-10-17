import { agent } from "@pagopa/ts-commons";
import {
  AbortableFetch,
  setFetchTimeout,
  toFetch,
} from "@pagopa/ts-commons/lib/fetch";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { config } from "../../app/config";
import { createClient } from "./models/client";

const httpApiFetch = agent.getHttpFetch(process.env);
const abortableFetch = AbortableFetch(httpApiFetch);

export const tokenizerApiClient = pipe(
  config,
  E.map((config) =>
    createClient({
      baseUrl: config.tokenizer.tokenizerApiBasePath,
      fetchApi: toFetch(
        setFetchTimeout(
          config.ioapi.serviceRequestTimeout as Millisecond,
          abortableFetch
        )
      ) as unknown as typeof fetch,
    })
  )
);
