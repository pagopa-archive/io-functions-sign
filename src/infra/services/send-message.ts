import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { MessageCreatedResponse } from "../../ui/api-models/MessageCreatedResponse";
import { makeHttpRequest } from "./http";
import { basePath, headers } from "./service";

const makeMessagePat = (fiscalCode: string) =>
  pipe(`/api/v1/messages/${fiscalCode}`, UrlFromString.decode);

export const sendMessage = (fiscalCode: FiscalCode) => (body: NewMessage) =>
  pipe(
    sequenceS(E.Apply)({
      basePath,
      headers,
      path: pipe(
        fiscalCode,
        makeMessagePat,
        E.mapLeft(() => new Error("Invalid path"))
      ),
    }),
    TE.fromEither,
    TE.chain(({ basePath, headers, path }) =>
      makeHttpRequest(basePath.href)({
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
