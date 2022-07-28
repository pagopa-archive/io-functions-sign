import * as t from "io-ts";
import * as E from "fp-ts/Either";
import * as RE from "fp-ts/ReaderEither";
import { pipe, flow } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import { IntegerFromString } from "@pagopa/ts-commons/lib/numbers";
import { readFromNodeEnv } from "../../app/env";

export const ServiceConfig = t.type({
  serviceBasePath: t.string,
  serviceSubscriptionKey: t.string,
  serviceRequestTimeout: t.number,
});

export type ServiceConfig = t.TypeOf<typeof ServiceConfig>;

export const getServiceConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  ServiceConfig
> = sequenceS(RE.Apply)({
  serviceBasePath: pipe(
    readFromNodeEnv("ServiceBasePath"),
    RE.orElse(() => RE.right("https://api.io.pagopa.it"))
  ),
  serviceSubscriptionKey: readFromNodeEnv("ServiceSubscriptionKey"),
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
