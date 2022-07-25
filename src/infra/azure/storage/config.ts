import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { readFromNodeEnv } from "../../../app/env";

export const StorageConfig = t.type({
  connectionString: t.string,
});

export type StorageConfig = t.TypeOf<typeof StorageConfig>;

export const getStorageConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  StorageConfig
> = sequenceS(RE.Apply)({
  connectionString: readFromNodeEnv("StorageAccountConnectionString"),
});
