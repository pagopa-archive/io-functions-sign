import { QueueServiceClient, QueueClient } from "@azure/storage-queue";
import { pipe } from "fp-ts/lib/function";

import * as TE from "fp-ts/TaskEither";

export const createQueueClient = (
  connectionString: string,
  queueName: string
) => {
  const queueServiceClient =
    QueueServiceClient.fromConnectionString(connectionString);
  return queueServiceClient.getQueueClient(queueName);
};

export const enqueueMessage = (queueClient: QueueClient) => (message: string) =>
  TE.tryCatch(
    () => pipe(message, btoa, queueClient.sendMessage),
    () => new Error("Message cannot be queued")
  );

export const queueExists = (queueClient: QueueClient) =>
  TE.tryCatch(
    () => queueClient.exists(),
    () => new Error("The specified queue does not exists")
  );
