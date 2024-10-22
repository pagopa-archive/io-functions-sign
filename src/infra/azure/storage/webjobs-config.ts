import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { pipe } from "fp-ts/lib/function";

import { readFromNodeEnv } from "../../../app/env";

export const WebJobsStorageConfig = t.type({
  connectionString: t.string,
  waitingMessageQueueName: t.string,
});

export type WebJobStorageConfig = t.TypeOf<typeof WebJobsStorageConfig>;

export const getWebJobsStorageConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  WebJobStorageConfig
> = sequenceS(RE.Apply)({
  connectionString: readFromNodeEnv("AzureWebJobsStorage"),
  waitingMessageQueueName: pipe(
    readFromNodeEnv("WaitingMessageQueueName"),
    RE.orElse(() => RE.right("waiting-for-message"))
  ),
});
