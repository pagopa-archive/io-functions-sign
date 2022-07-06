import * as t from "io-ts";
import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";

export const Timestamps = t.type({
  createdAt: UTCISODateFromString,
  updatedAt: UTCISODateFromString,
});

export const timestamps = () => ({
  createdAt: new Date(),
  updatedAt: new Date(),
});
