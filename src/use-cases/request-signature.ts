import { FiscalCode } from "../fiscal-code";

import { pipe } from "fp-ts/function";
import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";
import * as D from "io-ts/Decoder";

import { fromUser, SignerRepository } from "../signer";
import { UserRepository } from "../user";
import { Document } from "../document";

import {
  SignatureRequest,
  SignatureRequestRepository,
  createSignatureRequest,
} from "../signature-request";

const RequestSignaturePayload = D.struct({
  fiscalCode: FiscalCode,
  documents: D.array(Document),
});

type RequestSignaturePayload = D.TypeOf<typeof RequestSignaturePayload>;

export const requestSignature =
  (
    signers: SignerRepository,
    users: UserRepository,
    signatureRequests: SignatureRequestRepository
  ) =>
  (payload: RequestSignaturePayload): TE.TaskEither<Error, SignatureRequest> =>
    pipe(
      signers.getByFiscalCode(payload.fiscalCode),
      TO.fold(
        () =>
          pipe(
            users.getByFiscalCode(payload.fiscalCode),
            TE.fromTaskOption(() => new Error("user not found")),
            TE.map(fromUser),
            TE.chain(signers.add)
          ),
        TE.right
      ),
      TE.map((signer) => createSignatureRequest(signer, payload.documents)),
      TE.chain(signatureRequests.add)
    );
