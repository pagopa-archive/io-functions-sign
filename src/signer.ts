import { User } from "./user";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { FiscalCode } from "./fiscal-code";

export type Signer = {
  id: string;
};

export const createSignerFromUser = (u: User): Signer => ({
  id: `signer-${u.fiscalCode}`,
});

export type AddSigner = (signer: Signer) => TE.TaskEither<Error, Signer>;

export type GetSignerByFiscalCode = (
  fiscalCode: FiscalCode
) => TO.TaskOption<Signer>;
