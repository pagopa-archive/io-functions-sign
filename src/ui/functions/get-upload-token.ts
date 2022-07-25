import { AzureFunction } from "@azure/functions";
import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import * as RE from "fp-ts/ReaderEither";
import * as E from "fp-ts/Either";

import { pipe, flow } from "fp-ts/function";
import {
  error,
  HttpRequest,
  path,
  success,
} from "@pagopa/handler-kit/lib/http";

import { sequenceS } from "fp-ts/lib/Apply";
import { Subscription } from "../../signature-request/subscription";
import { SignatureRequest } from "../../signature-request/signature-request";
import { UploadToken } from "../api-models/UploadToken";
import { requireSubscriptionId } from "../http";
import { Document } from "../../signature-request/document";
import { makeGetDocumentUploadToken } from "../../app/use-cases/get-upload-token";

import { makeGetDocumentUploadToken as makeBlobStorageGetDocumentUploadToken } from "../../infra/azure/storage/upload-token";
import { createContainerClient } from "../../infra/azure/storage/client";
import { config } from "../../app/config";
import { getSignatureRequest } from "../../infra/azure/cosmos/signature-request";
import { requireSignatureRequestId } from "./get-signature-request";

export const requireDocumentId: (
  req: HttpRequest
) => E.Either<Error, SignatureRequest["id"]> = flow(
  path("documentId"),
  E.fromOption(() => new Error("Missing documentId in path"))
);

export const extractGetDocumentUploadTokenPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  {
    subscriptionId: Subscription["id"];
    signatureRequestId: SignatureRequest["id"];
    documentId: Document["id"];
  }
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    signatureRequestId: requireSignatureRequestId,
    documentId: requireDocumentId,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  E.chain(extractGetDocumentUploadTokenPayload),
  TE.fromEither
);

const getDocumentUploadToken = pipe(
  config,
  E.map((config) =>
    createContainerClient(config.storage.connectionString, "documents")
  ),
  E.map(makeBlobStorageGetDocumentUploadToken),
  E.map((blob) => makeGetDocumentUploadToken(getSignatureRequest, blob)),
  E.getOrElse(
    () => (_) => TE.left(new Error("Unable to connect to Blob Storage Service"))
  )
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    getDocumentUploadToken,
    error,
    success(UploadToken)
  ),
  azure.unsafeRun
);
