import * as E from "fp-ts/lib/Either";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe } from "fp-ts/lib/function";
import { config } from "../../app/config";
import { RequestMessageHeaders } from "../http-client";

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
  E.map((config) => {
    const headers: RequestMessageHeaders = {
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": config.service.serviceSubscriptionKey,
    };
    return headers;
  })
);
