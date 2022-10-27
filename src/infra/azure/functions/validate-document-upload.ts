import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import { pipe, flow, identity, constVoid } from "fp-ts/function";

import * as t from "io-ts";
import { last } from "fp-ts/ReadonlyNonEmptyArray";
import { split } from "fp-ts/string";
import { validate } from "@pagopa/handler-kit/lib/validation";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";

import {
  DocumentId,
  documentNotFoundError,
} from "../../../signature-request/document";
import {
  makeChangeDocumentStatus,
  makeValidateDocument,
} from "../../../app/use-cases/validate-document";
import {
  getSignatureRequest,
  upsertSignatureRequest,
} from "../cosmos/signature-request";

import { Config, config } from "../../../app/config";

import { createContainerClient } from "../storage/client";
import {
  makeDeleteDocumentUploaded,
  makeIsDocumentUploaded,
  makeMoveUploadDocument,
} from "../storage/document";
import {
  getUploadDocument,
  upsertUploadDocument,
} from "../cosmos/upload-document";
import { makeDeleteUploadedDocument } from "../../../app/use-cases/delete-uploaded-document";

const issuerUploadedContainerClient = (cfg: Config) =>
  createContainerClient(
    cfg.storage.connectionString,
    cfg.storage.issuerUploadedBlobContainerName
  );

const issuerValidatedContainerClient = (cfg: Config) =>
  createContainerClient(
    cfg.storage.connectionString,
    cfg.storage.issuerValidatedBlobContainerName
  );

const unableToConnectError = new Error(
  "Unable to connect to Blob Storage Service"
);
const isDocumentUploadedToBlobStorage = pipe(
  config,
  E.map(issuerUploadedContainerClient),
  E.map(makeIsDocumentUploaded),
  E.getOrElse(() => (_) => TE.left(unableToConnectError))
);

const moveDocumentUrlToValidatedBlobStorage = pipe(
  config,
  E.map(issuerValidatedContainerClient),
  E.map(makeMoveUploadDocument),
  E.getOrElse(
    () => (_sourceDocumentUrl, _documentId) => TE.left(unableToConnectError)
  )
);

const deleteDocumentUploadedFromBlobStorage = pipe(
  config,
  E.map(issuerUploadedContainerClient),
  E.map(makeDeleteDocumentUploaded),
  E.getOrElse(() => (_documentID) => TE.left(unableToConnectError))
);

/*
 * Validates the documents uploaded by the issuer by populating the database with the url in case of success.
 * When all the documents have been uploaded and validated, it is necessary to communicate to other services
 * that the signature request is ready to be signed. This communication takes place by writing the signature request
 * to a queue storage.
 */
const validateDocument = makeValidateDocument(
  getSignatureRequest,
  upsertSignatureRequest,
  isDocumentUploadedToBlobStorage,
  moveDocumentUrlToValidatedBlobStorage
);

const updateDocumentStatus = makeChangeDocumentStatus(
  getSignatureRequest,
  upsertSignatureRequest
);

const removeUploadedDocumentReferences = makeDeleteUploadedDocument(
  getUploadDocument,
  deleteDocumentUploadedFromBlobStorage,
  upsertUploadDocument
);

export const run = pipe(
  createHandler(
    flow(azure.fromBlobStorage(t.type({})), TE.fromEither),
    (blob) =>
      pipe(
        pipe(blob.uri, split("/"), last),
        validate(DocumentId, "Unable to validate the document id"),
        TE.fromEither,
        TE.chain((documentId) =>
          pipe(
            getUploadDocument(documentId),
            TE.chain(TE.fromOption((): Error => documentNotFoundError)),
            TE.map((uploadedDocument) => ({
              ...uploadedDocument,
              url: blob.uri,
            }))
          )
        ),
        TE.chain((payload) =>
          pipe(
            [
              pipe(payload, updateDocumentStatus("START_VALIDATION")),
              pipe(payload, validateDocument),
              pipe(payload, updateDocumentStatus("MARK_AS_READY")),
            ],
            A.sequence(TE.ApplicativeSeq),
            TE.altW(() => updateDocumentStatus("MARK_AS_INVALID")(payload)),
            TE.chain(() => removeUploadedDocumentReferences(payload))
          )
        )
      ),
    identity,
    constVoid
  ),
  azure.unsafeRun
);
