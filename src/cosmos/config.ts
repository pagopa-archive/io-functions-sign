import * as D from "io-ts/Decoder";
import * as RE from "fp-ts/ReaderEither";
import { pipe } from "fp-ts/function";

import { readFromNodeEnv } from "../env";

export const CosmosConfig = D.struct({
  connectionString: D.string,
});

export type CosmosConfig = D.TypeOf<typeof CosmosConfig>;

export const getCosmosConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  CosmosConfig
> = pipe(
  RE.Do,
  RE.bind("connectionString", () => readFromNodeEnv("CosmosDbConnectionString"))
);
