import { QueueServiceClient, QueueClient } from "@azure/storage-queue";

import * as TE from "fp-ts/TaskEither";

export const createQueueClient = (
  connectionString: string,
  queueName: string
) => {
  const queueServiceClient =
    QueueServiceClient.fromConnectionString(connectionString);
  return queueServiceClient.getQueueClient(queueName);
};

export const sendMessage = (message: string) => (queueClient: QueueClient) =>
  TE.tryCatch(
    () => queueClient.sendMessage(message),
    () => new Error("Message cannot be queued")
  );

export const queueExists = (queueClient: QueueClient) =>
  TE.tryCatch(
    () => queueClient.exists(),
    () => new Error("The specified queue does not exists")
  );
