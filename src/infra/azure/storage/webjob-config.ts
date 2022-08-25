import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { pipe } from "fp-ts/lib/function";

import { readFromNodeEnv } from "../../../app/env";

export const WebJobStorageConfig = t.type({
  connectionString: t.string,
  queueName: t.string,
});

export type WebJobStorageConfig = t.TypeOf<typeof WebJobStorageConfig>;

export const getWebJjobStorageConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  WebJobStorageConfig
> = sequenceS(RE.Apply)({
  connectionString: readFromNodeEnv("AzureWebJobsStorage"),
  queueName: pipe(
    readFromNodeEnv("QueueName"),
    RE.orElse(() => RE.right("waiting-for-signature"))
  ),
});
