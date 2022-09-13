import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { identity, pipe, flow } from "fp-ts/function";

import { findIndex, modifyAt } from "fp-ts/Array";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  GetSignatureRequest,
  SignatureRequest,
  signatureRequestNotFoundError,
  SignatureRequestStatus,
  UpsertSignatureRequest,
} from "../../signature-request/signature-request";

import { EntityNotFoundError } from "../../error";

import {
  Document,
  DocumentList,
  IsDocumentUploaded,
} from "../../signature-request/document";

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

const nextStatus = (
  request: SignatureRequest
): O.Option<SignatureRequestStatus> =>
  pipe(
    request,
    O.fromNullable,
    O.filter((request) =>
      request.documents.every((document) => NonEmptyString.is(document.url))
    ),
    O.filter((request) => request.status === "DRAFT"),
    O.map(() => "WAIT_FOR_ISSUER")
  );

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
          E.map((documents) => ({ ...request, documents })),
          E.map(
            flow(
              nextStatus,
              O.map((status) => ({
                ...request,
                status,
              })),
              O.getOrElse(() => request)
            )
          )
        )
      ),
      TE.chain(upsertSignatureRequest)
    );
