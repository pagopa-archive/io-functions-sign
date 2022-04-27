import { FiscalCode as pagoPAFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { flow, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as D from "io-ts/Decoder";

export const validateFiscalCode = flow(pagoPAFiscalCode.decode, E.isRight);

export type FiscalCode = pagoPAFiscalCode;

export const FiscalCode = pipe(
  D.string,
  D.refine((s): s is FiscalCode => validateFiscalCode(s), "FiscalCode")
);
