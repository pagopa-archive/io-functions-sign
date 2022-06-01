import { AzureFunction } from "@azure/functions";
import { absurd, pipe } from "fp-ts/lib/function";

import { createHandler, nopRequestDecoder } from "@pagopa/handler-kit";
import { jsonResponse } from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";

export const run: AzureFunction = pipe(
  createHandler(
    nopRequestDecoder,
    () =>
      TE.right({
        message: "it works",
      }),
    (e) => absurd(e as never),
    jsonResponse
  ),
  azure.unsafeRun
);
