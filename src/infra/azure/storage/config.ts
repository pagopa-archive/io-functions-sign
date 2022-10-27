import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { pipe } from "fp-ts/lib/function";

import { readFromNodeEnv } from "../../../app/env";
import {
  getWebJobsStorageConfigFromEnvironment,
  WebJobsStorageConfig,
} from "./webjobs-config";

export const StorageConfig = t.type({
  connectionString: t.string,
  issuerUploadedBlobContainerName: t.string,
  issuerValidatedBlobContainerName: t.string,
  webJobs: WebJobsStorageConfig,
});

export type StorageConfig = t.TypeOf<typeof StorageConfig>;

export const getStorageConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  StorageConfig
> = sequenceS(RE.Apply)({
  connectionString: readFromNodeEnv("StorageAccountConnectionString"),
  issuerUploadedBlobContainerName: pipe(
    readFromNodeEnv("IssuerUploadedBlobContainerName"),
    RE.orElse(() => RE.right("uploaded-documents"))
  ),
  issuerValidatedBlobContainerName: pipe(
    readFromNodeEnv("IssuerValidatedBlobContainerName"),
    RE.orElse(() => RE.right("validated-documents"))
  ),
  webJobs: getWebJobsStorageConfigFromEnvironment,
});
