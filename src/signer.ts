import { User } from "./user";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { FiscalCode } from "./fiscal-code";

export type Signer = {
  id: string;
};

export const fromUser = (u: User): Signer => ({
  id: `signer-${u.fiscalCode}`,
});

export interface SignerRepository {
  add: (signer: Signer) => TE.TaskEither<Error, Signer>;
  getByFiscalCode: (fiscalCode: FiscalCode) => TO.TaskOption<Signer>;
}
