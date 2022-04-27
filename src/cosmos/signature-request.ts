import {
  SignatureRequest,
  SignatureRequestRepository,
} from "../signature-request";

import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";

export class CosmosDBSignatureRequestRepository
  implements SignatureRequestRepository
{
  add(req: SignatureRequest) {
    return TE.left(new Error("not implemented"));
  }
  getById(id: SignatureRequest["id"]) {
    return TO.none;
  }
}
