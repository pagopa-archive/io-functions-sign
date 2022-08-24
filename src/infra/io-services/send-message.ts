import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { pipe } from "fp-ts/lib/function";

import { NewMessage } from "@pagopa/io-functions-services-sdk/NewMessage";

import { ioApiClient } from "./client";

export const submitMessageForUser =
  (message: NewMessage) => (fiscal_code: FiscalCode) =>
    pipe(
      ioApiClient,
      TE.fromEither,
      TE.chain((client) =>
        TE.tryCatch(
          () => client.submitMessageforUser({ fiscal_code, message }),
          E.toError
        )
      )
    );
