import * as t from "io-ts";
import * as RE from "fp-ts/ReaderEither";
import { pipe } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import { readFromNodeEnv } from "../../app/env";

export const IOApiClientConfig = t.type({
  serviceBasePath: t.string,
  serviceSubscriptionKey: t.string,
});

export type IOApiClientConfig = t.TypeOf<typeof IOApiClientConfig>;

export const getIOApiClientConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  IOApiClientConfig
> = sequenceS(RE.Apply)({
  serviceBasePath: pipe(
    readFromNodeEnv("IOApiBasePath"),
    RE.orElse(() => RE.right("https://api.io.pagopa.it"))
  ),
  serviceSubscriptionKey: readFromNodeEnv("IOApiSubscriptionKey"),
});
