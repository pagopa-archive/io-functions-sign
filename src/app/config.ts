import * as t from "io-ts";
import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";
import {
  CosmosConfig,
  getCosmosConfigFromEnvironment,
} from "../infra/azure/cosmos/config";
import {
  getIOApiClientConfigFromEnvironment,
  IOApiClientConfig,
} from "../infra/io-services/config";

import {
  StorageConfig,
  getStorageConfigFromEnvironment,
} from "../infra/azure/storage/config";

export const Config = t.type({
  cosmos: CosmosConfig,
  ioapi: IOApiClientConfig,
  storage: StorageConfig,
});

export type Config = t.TypeOf<typeof Config>;

export const getConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  Config
> = sequenceS(RE.Apply)({
  cosmos: getCosmosConfigFromEnvironment,
  ioapi: getIOApiClientConfigFromEnvironment,
  storage: getStorageConfigFromEnvironment,
});

export const config = getConfigFromEnvironment(process.env);
