import { RequestHeaders } from "@pagopa/ts-commons/lib/requests";
import { Dispatcher, request } from "undici";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { pipe } from "fp-ts/lib/function";
import { RequestOptions } from "undici/types/dispatcher";

export const is2xx = (r: Dispatcher.ResponseData): boolean =>
  r.statusCode >= 200 && r.statusCode < 300;

export type RequestMessageHeaders = RequestHeaders<
  "content-type" | "Ocp-Apim-Subscription-Key"
>;
export const makeHttpRequest =
  (basePath: string | URL) => (requestOptions: RequestOptions) =>
    pipe(
      TE.tryCatch(
        () =>
          request(basePath, requestOptions)
            .then((r) => {
              if (!is2xx(r)) {
                throw Error("Unexpected webhook response");
              }
              return r;
            })
            .then((r) => r.body.json()),
        E.toError
      )
    );
