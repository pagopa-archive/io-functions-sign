import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { findFirst } from "fp-ts/lib/Array";
import {
  GetSignatureRequest,
  signatureRequestNotFoundError,
} from "../../signature-request/signature-request";
import { GetDocumentUploadToken } from "../../signature-request/upload-token";

import { documentNotFoundError } from "../../signature-request/document";
import { ActionNotAllowedError } from "../../error";
import { id } from "../../id";
import { timestamps } from "../../timestamps";
import { addUploadDocument } from "../../infra/azure/cosmos/upload-document";
import { GetDocumentPayload } from "./get-document";

export const makeGetDocumentUploadToken =
  (
    getSignatureRequest: GetSignatureRequest,
    getDocumentUploadToken: GetDocumentUploadToken
  ) =>
  (payload: GetDocumentPayload) =>
    pipe(
      getSignatureRequest(payload.signatureRequestId, payload.subscriptionId),
      TE.chainW(TE.fromOption(() => signatureRequestNotFoundError)),
      TE.filterOrElse(
        (signatureRequest) => signatureRequest.status === "DRAFT",
        (): Error =>
          new ActionNotAllowedError(
            "Upload token can only be generated if the signature request is in the DRAFT state"
          )
      ),

      TE.chain((signatureRequest) =>
        pipe(
          signatureRequest.documents,
          findFirst((document) => document.id === payload.documentId),
          TE.fromOption((): Error => documentNotFoundError),
          TE.map(() => ({
            id: id(),
            signatureRequestSubscriptionId: payload.subscriptionId,
            signatureRequestId: payload.signatureRequestId,
            signatureRequestDocumentId: payload.documentId,
            ...timestamps(),
          })),
          TE.chainFirst(addUploadDocument)
        )
      ),

      TE.chain((uploadDocument) => getDocumentUploadToken(uploadDocument.id))
    );
