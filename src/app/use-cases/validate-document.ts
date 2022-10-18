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

import { ActionNotAllowedError, EntityNotFoundError } from "../../error";
import {
  Document,
  DocumentList,
  IsDocumentUploaded,
} from "../../signature-request/document";

import {
  MoveUploadDocument,
  UploadDocument,
} from "../../signature-request/upload-document";
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
      E.filterOrElse(
        () => request.status === "DRAFT",
        (): Error =>
          new ActionNotAllowedError(
            "Document status can only be changed if the signature request is in the DRAFT state"
          )
      ),
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

export const makeValidateDocument =
  (
    getSignatureRequest: GetSignatureRequest,
    upsertSignatureRequest: UpsertSignatureRequest,
    isDocumentUploaded: IsDocumentUploaded,
    moveDocumentUrlToValidatedBlobStorage: MoveUploadDocument
  ) =>
  (payload: UploadDocument) =>
    pipe(
      payload.url,
      TE.fromNullable(new Error("Url not found in document")),
      TE.chain(() =>
        pipe(
          isDocumentUploaded(payload.id),
          TE.filterOrElse(
            identity,
            () => new Error("Unable to find the uploaded document")
          ),
          TE.chain(() =>
            pipe(
              moveDocumentUrlToValidatedBlobStorage(
                payload.url as string,
                payload.signatureRequestDocumentId
              )
            )
          ),
          TE.chain((validatedUrl) =>
            pipe(
              getSignatureRequest(
                payload.signatureRequestId,
                payload.signatureRequestSubscriptionId
              ),
              TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
              TE.chainEitherKW((request) =>
                pipe(
                  request,
                  addUrlToDocument(
                    payload.signatureRequestDocumentId,
                    validatedUrl
                  ),
                  E.map((documents) => ({ ...request, documents }))
                )
              ),
              TE.chain(upsertSignatureRequest)
            )
          )
        )
      )
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
  (payload: UploadDocument) =>
    pipe(
      getSignatureRequest(
        payload.signatureRequestId,
        payload.signatureRequestSubscriptionId
      ),
      TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
      TE.chainEitherKW((request) =>
        pipe(
          request,
          changeDocumentStatus(payload.signatureRequestDocumentId, action),
          E.map((documents) => ({ ...request, documents }))
        )
      ),
      TE.chain(upsertSignatureRequest)
    );
