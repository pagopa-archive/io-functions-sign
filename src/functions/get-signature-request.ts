import { pipe } from "fp-ts/function";

import * as TE from "fp-ts/TaskEither";

import * as T from "fp-ts/Task";

import { makeGetSignatureRequest } from "../use-cases/get-signature-request";

import { getSignatureRequestById } from "../cosmos/signature-request";

const getSignatureRequest = makeGetSignatureRequest(getSignatureRequestById);

export default async () =>
  pipe(
    getSignatureRequest("eba6c55b-7a2b-4b3e-8e3e-fbb0f5bf4652"),
    TE.fold(
      (e) =>
        T.of({
          body: JSON.stringify({
            error: e.message,
          }),
          status: 422,
        }),
      (response) =>
        T.of({
          body: JSON.stringify({ response }),
          status: 201,
        })
    )
  )();
