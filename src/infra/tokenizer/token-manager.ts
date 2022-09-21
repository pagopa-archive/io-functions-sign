import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { config } from "../../app/config";
import { tokenizerApiClient } from "./client";

export const getTokenFromFiscalCode = (fiscalCode: FiscalCode) =>
  pipe(
    config,
    TE.fromEither,
    TE.chain((config) =>
      pipe(
        tokenizerApiClient,
        TE.fromEither,
        TE.chain((client) =>
          TE.tryCatch(
            () =>
              client.searchUsingPOST({
                api_key: config.tokenizer.tokenizerApiSubscriptionKey,
                body: { pii: fiscalCode },
              }),
            E.toError
          )
        )
      )
    )
  );

export const getFiscalCodeFromToken = (token: string) =>
  pipe(
    config,
    TE.fromEither,
    TE.chain((config) =>
      pipe(
        tokenizerApiClient,
        TE.fromEither,
        TE.chain((client) =>
          TE.tryCatch(
            () =>
              client.findPiiUsingGET({
                api_key: config.tokenizer.tokenizerApiSubscriptionKey,
                token,
              }),
            E.toError
          )
        )
      )
    )
  );
