import * as t from "io-ts";
import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";

export const ExpirationDateTime = t.union([
  UTCISODateFromString,
  t.null,
  t.undefined,
]);

export type ExpirationDateTime = t.TypeOf<typeof ExpirationDateTime>;

export class ExpirationDateTimeNotValid extends Error {
  name = "ExpirationDateTimeNotValidError";
  constructor() {
    super("The specified expiration datetime is not valid");
  }
}
