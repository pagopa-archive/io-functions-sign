import * as t from "io-ts";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { isBefore } from "date-fns";

const isDate = (m: unknown): m is Date => m instanceof Date;
export const FutureDate = new t.Type<Date, string, unknown>(
  "FutureDate",
  isDate,
  (u, c) =>
    isDate(u)
      ? t.success(u)
      : pipe(
          t.string.validate(u, c),
          E.chain((s) => {
            const d = new Date(s);
            return isBefore(d, new Date()) ? t.failure(u, c) : t.success(d);
          })
        ),
  (a) => a.toISOString()
);

export const ExpirationDateTime = t.union([FutureDate, t.null, t.undefined]);

export type ExpirationDateTime = t.TypeOf<typeof ExpirationDateTime>;

export class ExpirationDateTimeNotValid extends Error {
  name = "ExpirationDateTimeNotValidError";
  constructor() {
    super("The specified expiration datetime is not valid");
  }
}
