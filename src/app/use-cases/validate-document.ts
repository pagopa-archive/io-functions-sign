import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import { identity, pipe } from "fp-ts/function";

import { validate } from "@pagopa/handler-kit/lib/validation";
import {
  GetSignatureRequest,
  SignatureRequest,
  signatureRequestNotFoundError,
  UpsertSignatureRequest,
} from "../../signature-request/signature-request";

import { EntityNotFoundError } from "../../error";
import {
  Document,
  DocumentList,
  IsDocumentUploaded,
} from "../../signature-request/document";

import { GetDocumentPayload } from "./get-document";
import { dispatchOnDocument, DocumentAction } from "./status-document";

const documentNotFoundError = new EntityNotFoundError("Document not found");
export const addUrlToDocument =
  (documentId: Document["id"], url: string) => (request: SignatureRequest) =>
    pipe(
      request.documents,
      A.findIndex((document) => document.id === documentId),
      O.chain((index) =>
        pipe(
          request.documents,
          A.modifyAt(index, (document) => ({
            ...document,
            url,
          }))
        )
      ),
      E.fromOption(() => documentNotFoundError),
      E.chainW(validate(DocumentList, "Unable to validate document list"))
    );

export const changeDocumentStatus =
  (documentId: Document["id"], action: DocumentAction) =>
  (request: SignatureRequest) =>
    pipe(
      request.documents,
      A.findIndex((document) => document.id === documentId),
      E.fromOption(() => documentNotFoundError),
      E.chainW((index) =>
        pipe(
          request.documents,
          A.lookup(index),
          E.fromOption(() => documentNotFoundError),
          E.chain(dispatchOnDocument(action)),
          E.chain((document) =>
            pipe(
              request.documents,
              A.modifyAt(index, () => document),
              E.fromOption(() => documentNotFoundError)
            )
          )
        )
      ),
      E.chainW(validate(DocumentList, "Unable to validate document list"))
    );

export type ValidateDocumentPayload = GetDocumentPayload & {
  documentUrl: string;
};

export const makeValidateDocument =
  (
    getSignatureRequest: GetSignatureRequest,
    upsertSignatureRequest: UpsertSignatureRequest,
    isDocumentUploaded: IsDocumentUploaded
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
      TE.chain(upsertSignatureRequest)
    );
/*
 * Dispatches an action on a document within a signature request and then updates the document status on DB.
 */
export const makeChangeDocumentStatus =
  (
    getSignatureRequest: GetSignatureRequest,
    upsertSignatureRequest: UpsertSignatureRequest
  ) =>
  (action: DocumentAction) =>
  (payload: ValidateDocumentPayload) =>
    pipe(
      getSignatureRequest(payload.signatureRequestId, payload.subscriptionId),
      TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
      TE.chainEitherKW((request) =>
        pipe(
          request,
          changeDocumentStatus(payload.documentId, action),
          E.map((documents) => ({ ...request, documents }))
        )
      ),
      TE.chain(upsertSignatureRequest)
    );
