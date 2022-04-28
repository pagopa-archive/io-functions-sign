import { pipe } from "fp-ts/function";
import * as R from "fp-ts/Reader";
import * as E from "fp-ts/Either";

export const readFromNodeEnv = (key: string) =>
  pipe(
    R.ask<NodeJS.ProcessEnv>(),
    R.map((processEnv) =>
      pipe(
        processEnv[key],
        E.fromNullable(new Error(`unable to find "${key}" in the environment`))
      )
    )
  );
