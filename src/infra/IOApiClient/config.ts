import * as t from "io-ts";
import * as E from "fp-ts/Either";
import * as RE from "fp-ts/ReaderEither";
import { pipe, flow } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import { IntegerFromString } from "@pagopa/ts-commons/lib/numbers";
import { readFromNodeEnv } from "../../app/env";

export const IOApiClientConfig = t.type({
  serviceBasePath: t.string,
  serviceSubscriptionKey: t.string,
  serviceRequestTimeout: t.number,
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
  serviceRequestTimeout: pipe(
    readFromNodeEnv("ServiceRequestTimeout"),
    RE.chainEitherK(
      flow(
        IntegerFromString.decode,
        E.mapLeft(() => new Error("Invalid ServiceRequestTimeout"))
      )
    ),
    RE.orElse(() => RE.right(10000))
  ),
});
