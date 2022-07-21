import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe, flow } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { config } from "../../app/config";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { MessageCreatedResponse } from "../../ui/api-models/MessageCreatedResponse";
import { makeHttpRequest, RequestMessageHeaders } from "./http";

const messageForUserUrl = (fiscalCode: FiscalCode) =>
  pipe(`/api/v1/messages/${fiscalCode}`, UrlFromString.decode);

const makeRequestParameters = (fiscalCode: FiscalCode) =>
  pipe(
    config,
    E.chain((config) =>
      pipe(
        sequenceS(E.Apply)({
          base_path: pipe(config.service.serviceBasePath, UrlFromString.decode),
          path: pipe(fiscalCode, messageForUserUrl),
        }),
        E.bimap(
          () => new Error("Invalid service parameters"),
          ({ base_path, path }) => {
            const headers: RequestMessageHeaders = {
              "content-type": "application/json",
              "Ocp-Apim-Subscription-Key":
                config.service.serviceSubscriptionKey,
            };
            return { base_path, path, headers };
          }
        )
      )
    )
  );

export const sendMessage = (fiscalCode: FiscalCode) => (body: NewMessage) =>
  pipe(
    fiscalCode,
    makeRequestParameters,
    TE.fromEither,
    TE.chain(({ base_path, path, headers }) =>
      makeHttpRequest(base_path.href)({
        body: JSON.stringify(body),
        method: "POST",
        path: path.href,
        headers,
      })
    ),
    TE.chain(
      flow(
        MessageCreatedResponse.decode,
        E.mapLeft(() => new Error("Invalid response")),
        TE.fromEither
      )
    )
  );
