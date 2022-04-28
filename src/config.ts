import * as D from "io-ts/Decoder";
import * as RE from "fp-ts/ReaderEither";
import { pipe } from "fp-ts/function";

import { CosmosConfig, getCosmosConfigFromEnvironment } from "./cosmos/config";

export const Config = D.struct({
  cosmos: CosmosConfig,
});

export type Config = D.TypeOf<typeof Config>;

export const getConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  Config
> = pipe(
  RE.Do,
  RE.bind("cosmos", () => getCosmosConfigFromEnvironment)
);

export const config = getConfigFromEnvironment(process.env);
