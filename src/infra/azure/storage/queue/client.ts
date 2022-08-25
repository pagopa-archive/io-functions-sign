import { QueueServiceClient, QueueClient } from "@azure/storage-queue";
import { toError } from "fp-ts/lib/Either";

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { config } from "../../../../app/config";

export const queueClient: E.Either<Error, QueueClient> = pipe(
  config,
  E.map((config) => {
    const queueServiceClient = QueueServiceClient.fromConnectionString(
      config.storage.webJobs.connectionString
    );
    return queueServiceClient.getQueueClient(
      config.storage.webJobs.waitingSignatureQueueName
    );
  })
);

export const enqueueMessage = (queueClient: QueueClient) => (message: string) =>
  TE.tryCatch(
    () => queueClient.sendMessage(Buffer.from(message).toString("base64")),
    toError
  );

export const queueExists = (queueClient: QueueClient) =>
  TE.tryCatch(() => queueClient.exists(), toError);
