import { Signer, SignerRepository } from "../signer";

import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { FiscalCode } from "../fiscal-code";

export class CosmosDBSignerRepository implements SignerRepository {
  add(signer: Signer) {
    return TE.left(new Error("not yet implemented"));
  }
  getByFiscalCode(fiscalCode: FiscalCode) {
    return TO.none;
  }
}
