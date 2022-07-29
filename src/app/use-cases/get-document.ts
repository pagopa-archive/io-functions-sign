import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { findFirst } from "fp-ts/Array";
import {
  Document,
  documentNotFoundError,
} from "../../signature-request/document";
import {
  SignatureRequest,
  signatureRequestNotFoundError,
} from "../../signature-request/signature-request";
import { Subscription } from "../../signature-request/subscription";

import { GetSignatureRequest } from "../../signature-request/signature-request";

export type GetDocumentPayload = {
  subscriptionId: Subscription["id"];
  signatureRequestId: SignatureRequest["id"];
  documentId: Document["id"];
};

export const makeGetDocument =
  (getSignatureRequest: GetSignatureRequest) => (payload: GetDocumentPayload) =>
    pipe(
      getSignatureRequest(payload.signatureRequestId, payload.subscriptionId),
      TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
      TE.map((signatureRequest) => signatureRequest.documents),
      TE.chainOptionK((): Error => documentNotFoundError)(
        findFirst((document) => document.id === payload.documentId)
      )
    );
