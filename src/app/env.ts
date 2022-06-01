import { pipe } from "fp-ts/function";
import { lookup } from "fp-ts/Record";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

export const readFromNodeEnv = (key: string) => (env: NodeJS.ProcessEnv) =>
  pipe(
    env,
    lookup(key),
    O.chain(O.fromNullable),
    E.fromOption(() => new Error(`unable to find "${key}" in node environment`))
  );
