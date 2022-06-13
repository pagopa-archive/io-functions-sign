import * as t from "io-ts";

import { TaskEither } from "fp-ts/TaskEither";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";

export const SignerId = t.string;

export const Signer = t.type({
  id: SignerId,
});

export type Signer = t.TypeOf<typeof Signer>;

export type GetSignerByFiscalCode = (
  fiscalCode: FiscalCode
) => TaskEither<Error, Signer>;
