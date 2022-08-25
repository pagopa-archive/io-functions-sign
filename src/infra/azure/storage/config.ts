import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { pipe } from "fp-ts/lib/function";

import { readFromNodeEnv } from "../../../app/env";
import {
  getWebJjobStorageConfigFromEnvironment,
  WebJobStorageConfig,
} from "./webjob-config";

export const StorageConfig = t.type({
  connectionString: t.string,
  issuerBlobContainerName: t.string,
  webJob: WebJobStorageConfig,
});

export type StorageConfig = t.TypeOf<typeof StorageConfig>;

export const getStorageConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  StorageConfig
> = sequenceS(RE.Apply)({
  connectionString: readFromNodeEnv("StorageAccountConnectionString"),
  issuerBlobContainerName: pipe(
    readFromNodeEnv("IssuerBlobContainerName"),
    RE.orElse(() => RE.right("documents"))
  ),
  webJob: getWebJjobStorageConfigFromEnvironment,
});
