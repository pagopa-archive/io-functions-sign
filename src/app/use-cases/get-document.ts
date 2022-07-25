import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { findFirst } from "fp-ts/Array";
import { Document } from "../../signature-request/document";
import { SignatureRequest } from "../../signature-request/signature-request";
import { Subscription } from "../../signature-request/subscription";

import { GetSignatureRequest } from "../../signature-request/signature-request";

import { EntityNotFoundError } from "../../error";

export type GetDocumentPayload = {
  subscriptionId: Subscription["id"];
  signatureRequestId: SignatureRequest["id"];
  documentId: Document["id"];
};

export const makeGetDocument =
  (getSignatureRequest: GetSignatureRequest) => (payload: GetDocumentPayload) =>
    pipe(
      getSignatureRequest(payload.signatureRequestId, payload.subscriptionId),
      TE.chainW(
        TE.fromOption(
          () => new EntityNotFoundError("Signature request not found")
        )
      ),
      TE.map((signatureRequest) => signatureRequest.documents),
      TE.chainOptionK(
        (): Error => new EntityNotFoundError("Document not found")
      )(findFirst((document) => document.id === payload.documentId))
    );
