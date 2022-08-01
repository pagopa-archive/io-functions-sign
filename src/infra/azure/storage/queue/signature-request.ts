import { QueueClient } from "@azure/storage-queue";

import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { SignatureRequest } from "../../../../signature-request/signature-request";
import { enqueueMessage } from "./client";

export type EnqueueSignatureRequest = (
  request: SignatureRequest
) => TE.TaskEither<Error, SignatureRequest>;

export const enqueueSignatureRequest =
  (request: SignatureRequest) => (client: QueueClient) =>
    pipe(
      {
        signatureRequestId: request.id,
        subscriptionId: request.subscriptionId,
      },
      JSON.stringify,
      enqueueMessage(client),
      TE.map(() => request)
    );
