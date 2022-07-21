import * as t from "io-ts";

import * as RE from "fp-ts/ReaderEither";
import { pipe } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import { readFromNodeEnv } from "../../app/env";

export const ServiceConfig = t.type({
  serviceBasePath: t.string,
  serviceSubscriptionKey: t.string,
});

export type ServiceConfig = t.TypeOf<typeof ServiceConfig>;

export const getServiceConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  ServiceConfig
> = sequenceS(RE.Apply)({
  serviceBasePath: pipe(
    readFromNodeEnv("ServiceBasePath"),
    RE.orElse(() => RE.right("https://api.io.pagopa.it/api/v1"))
  ),
  serviceSubscriptionKey: readFromNodeEnv("ServiceSubscriptionKey"),
});
