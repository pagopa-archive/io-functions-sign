import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import { pipe, flow, identity } from "fp-ts/function";

import * as t from "io-ts";
import { last } from "fp-ts/ReadonlyNonEmptyArray";
import { split } from "fp-ts/string";
import { validate } from "@pagopa/handler-kit/lib/validation";
import * as E from "fp-ts/Either";
import {
  SignatureRequest,
  SignatureRequestId,
} from "../../../signature-request/signature-request";
import { SubscriptionId } from "../../../signature-request/subscription";
import { DocumentId } from "../../../signature-request/document";
import {
  makeValidateDocument,
  ValidateDocumentPayload,
} from "../../../app/use-cases/validate-document";
import {
  getSignatureRequest,
  upsertSignatureRequest,
} from "../cosmos/signature-request";

import { config } from "../../../app/config";

import { createContainerClient } from "../storage/client";
import { makeIsDocumentUploaded } from "../storage/document";
import { queueClient } from "../storage/queue/client";
import { enqueueSignatureRequest } from "../storage/queue/signature-request";

const isDocumentUploadedToBlobStorage = pipe(
  config,
  E.map((config) =>
    createContainerClient(
      config.storage.connectionString,
      config.storage.issuerBlobContainerName
    )
  ),
  E.map(makeIsDocumentUploaded),
  E.getOrElse(
    () => (_) => TE.left(new Error("Unable to connect to Blob Storage Service"))
  )
);

/*
 * Instantiates a connection with a Storage Queue and queues a message in JSON format
 * containing the information relating to the signature request.
 */
const enqueueRequestAwaitingSignature = (request: SignatureRequest) =>
  pipe(
    queueClient,
    E.map(enqueueSignatureRequest(request)),
    TE.fromEither,
    TE.flatten
  );

const validateDocument = makeValidateDocument(
  getSignatureRequest,
  upsertSignatureRequest,
  isDocumentUploadedToBlobStorage,
  enqueueRequestAwaitingSignature
);

export const run = pipe(
  createHandler(
    flow(
      azure.fromBlobStorage(
        t.type({
          signatureRequestId: SignatureRequestId,
          subscriptionId: SubscriptionId,
        })
      ),
      TE.fromEither
    ),
    (blob) =>
      pipe(
        pipe(blob.uri, split("/"), last),
        validate(DocumentId, "Unable to validate the document id"),
        TE.fromEither,
        TE.map(
          (documentId): ValidateDocumentPayload => ({
            ...blob.metadata,
            documentId,
            documentUrl: blob.uri,
          })
        ),
        TE.chain(validateDocument)
      ),
    identity,
    identity
  ),
  azure.unsafeRun
);
