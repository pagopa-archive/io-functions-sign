import * as t from "io-ts";
import * as RE from "fp-ts/ReaderEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";

import { readFromNodeEnv } from "../../app/env";

export const TokenizerApiClientConfig = t.type({
  tokenizerApiBasePath: t.string,
  tokenizerApiSubscriptionKey: t.string,
});

export type TokenizerApiClientConfig = t.TypeOf<
  typeof TokenizerApiClientConfig
>;

export const getTokenizerApiClientConfigFromEnvironment: RE.ReaderEither<
  NodeJS.ProcessEnv,
  Error,
  TokenizerApiClientConfig
> = sequenceS(RE.Apply)({
  tokenizerApiBasePath: pipe(
    readFromNodeEnv("TokenizerApiBasePath"),
    RE.orElse(() => RE.right("https://api.tokenizer.pdv.pagopa.it/"))
  ),
  tokenizerApiSubscriptionKey: readFromNodeEnv("TokenizerApiSubscriptionKey"),
});
