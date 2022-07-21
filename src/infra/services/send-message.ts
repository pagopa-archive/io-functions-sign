import { IncomingHttpHeaders } from "http2";

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Dispatcher, request } from "undici";

import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { UrlFromString, ValidUrl } from "@pagopa/ts-commons/lib/url";
import { pipe, flow } from "fp-ts/lib/function";
import { Errors } from "io-ts";
import { config } from "../../app/config";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { MessageCreatedResponse } from "../../ui/api-models/MessageCreatedResponse";

const is2xx = (r: Dispatcher.ResponseData): boolean =>
  r.statusCode >= 200 && r.statusCode < 300;

const messageForUserUrl = (
  url: ValidUrl,
  fiscalCode: FiscalCode
): E.Either<Errors, ValidUrl> =>
  pipe(`${url.href}/messages/${fiscalCode}`, UrlFromString.decode);

const getRequestParameters = (fiscalCode: FiscalCode) =>
  pipe(
    config,
    E.chain((config) =>
      pipe(
        config.service.serviceBasePath,
        UrlFromString.decode,
        E.chain((basePath) => messageForUserUrl(basePath, fiscalCode)),
        E.bimap(
          () => new Error("Invalid service parameters"),
          (url) => {
            const headers = {
              "content-type": "application/json",
              "Ocp-Apim-Subscription-Key":
                config.service.serviceSubscriptionKey,
            } as IncomingHttpHeaders;
            return { url, headers };
          }
        )
      )
    )
  );

export const sendMessage = (fiscalCode: FiscalCode) => (body: NewMessage) =>
  pipe(
    getRequestParameters(fiscalCode),
    TE.fromEither,
    TE.chain((el) => makeHttpRequest(el.url, JSON.stringify(body), el.headers)),
    TE.chain(
      flow(
        MessageCreatedResponse.decode,
        E.mapLeft(() => new Error("Invalid response")),
        TE.fromEither
      )
    )
  );

export const makeHttpRequest = (
  url: ValidUrl,
  body: string,
  headers: IncomingHttpHeaders
) =>
  pipe(
    TE.tryCatch(
      () =>
        request(url.href, {
          body,
          headers,
          method: "POST",
        })
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
