import { pipe } from "fp-ts/function";
import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";
import * as D from "io-ts/Decoder";
import { FiscalCode } from "../fiscal-code";

import {
  createSignerFromUser,
  AddSigner,
  GetSignerByFiscalCode,
} from "../signer";
import { GetUserByFiscalCode } from "../user";
import { Document } from "../document";

import {
  SignatureRequest,
  createSignatureRequest,
  AddSignatureRequest,
} from "../signature-request";

export const RequestSignaturePayload = D.struct({
  fiscalCode: FiscalCode,
  documents: D.array(Document),
});

type RequestSignaturePayload = D.TypeOf<typeof RequestSignaturePayload>;

export const makeRequestSignature =
  (
    getSignerByFiscalCode: GetSignerByFiscalCode,
    getUserByFiscalCode: GetUserByFiscalCode,
    addSigner: AddSigner,
    addSignatureRequest: AddSignatureRequest
  ) =>
  (payload: RequestSignaturePayload): TE.TaskEither<Error, SignatureRequest> =>
    pipe(
      getSignerByFiscalCode(payload.fiscalCode),
      TO.fold(
        () =>
          pipe(
            getUserByFiscalCode(payload.fiscalCode),
            TE.fromTaskOption(() => new Error("user not found")),
            TE.map(createSignerFromUser),
            TE.chain(addSigner)
          ),
        TE.right
      ),
      TE.map((signer) => createSignatureRequest(signer, payload.documents)),
      TE.chain(addSignatureRequest)
    );
