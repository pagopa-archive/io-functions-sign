import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";

import { findIndex, modifyAt } from "fp-ts/Array";
import { validate } from "@pagopa/handler-kit/lib/validation";
import {
  GetSignatureRequest,
  SignatureRequest,
  signatureRequestNotFoundError,
  UpsertSignatureRequest,
  status,
} from "../../signature-request/signature-request";

import { EntityNotFoundError } from "../../error/entity-not-found";

import {
  Document,
  DocumentList,
  IsDocumentUploaded,
} from "../../signature-request/document";
import { EnqueueSignatureRequest } from "../../signature-request/signature-request";
import { GetDocumentPayload } from "./get-document";

export const addUrlToDocument =
  (documentId: Document["id"], url: string) => (request: SignatureRequest) =>
    pipe(
      request.documents,
      findIndex((document) => document.id === documentId),
      O.chain((index) =>
        pipe(
          request.documents,
          modifyAt(index, (document) => ({
            ...document,
            url,
          }))
        )
      ),
      E.fromOption(() => new EntityNotFoundError("Document not found")),
      E.chainW(validate(DocumentList, "Unable to validate document list"))
    );

export type ValidateDocumentPayload = GetDocumentPayload & {
  documentUrl: string;
};

export const makeValidateDocument =
  (
    getSignatureRequest: GetSignatureRequest,
    upsertSignatureRequest: UpsertSignatureRequest,
    isDocumentUploaded: IsDocumentUploaded,
    enqueueRequestAwaitingSignature: EnqueueSignatureRequest
  ) =>
  (payload: ValidateDocumentPayload) =>
    pipe(
      isDocumentUploaded(payload.documentId),
      TE.filterOrElse(
        identity,
        () => new Error("Unable to find the uploaded document")
      ),
      TE.chain(() =>
        getSignatureRequest(payload.signatureRequestId, payload.subscriptionId)
      ),
      TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
      TE.chainEitherKW((request) =>
        pipe(
          request,
          addUrlToDocument(payload.documentId, payload.documentUrl),
          E.map((documents) => ({ ...request, documents }))
        )
      ),
      TE.chain(upsertSignatureRequest),
      TE.chain((signatureRequest) =>
        status(signatureRequest) === "WAIT_FOR_SIGNATURE"
          ? enqueueRequestAwaitingSignature(signatureRequest)
          : TE.right(signatureRequest)
      )
    );
