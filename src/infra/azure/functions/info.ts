import { AzureFunction } from "@azure/functions";
import { pipe } from "fp-ts/lib/function";

import { createHandler, nopRequestDecoder } from "@pagopa/handler-kit";
import { success, error } from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";

import * as t from "io-ts";

export const run: AzureFunction = pipe(
  createHandler(
    nopRequestDecoder,
    () =>
      TE.right({
        message: "it works",
      }),
    error,
    success(t.type({ message: t.string }))
  ),
  azure.unsafeRun
);
