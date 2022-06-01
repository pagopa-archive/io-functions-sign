import * as crypto from "node:crypto";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { DocumentList } from "../../signature-request/document";
import { Subscription } from "../../signature-request/subscription";
import { GetSignerByFiscalCode } from "../../signer/signer";

import {
  SignatureRequest,
  AddSignatureRequest,
} from "../../signature-request/signature-request";

export type RequestSignaturePayload = {
  subscriptionId: Subscription["id"];
  fiscalCode: FiscalCode;
  documents: DocumentList;
};

export const makeRequestSignature =
  (
    getSignerByFiscalCode: GetSignerByFiscalCode,
    addSignatureRequest: AddSignatureRequest
  ) =>
  (payload: RequestSignaturePayload): TE.TaskEither<Error, SignatureRequest> =>
    pipe(
      getSignerByFiscalCode(payload.fiscalCode),
      TE.map(
        (signer): SignatureRequest => ({
          id: crypto.randomUUID(),
          signerId: signer.id,
          subscriptionId: payload.subscriptionId,
          documents: payload.documents,
        })
      ),
      TE.chain(addSignatureRequest)
    );
