import * as t from "io-ts";

import { TaskEither } from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/Option";

import { Timestamps } from "../timestamps";
import { EntityNotFoundError } from "../error";
import { SubscriptionId } from "./subscription";
import { SignatureRequestId } from "./signature-request";
import { DocumentId } from "./document";

export const UploadDocumentId = t.string;

export const UploadDocument = t.intersection([
  t.type({
    id: UploadDocumentId,
    signatureRequestSubscriptionId: SubscriptionId,
    signatureRequestId: SignatureRequestId,
    signatureRequestDocumentId: DocumentId,
  }),
  t.partial({
    url: t.string,
    validated: t.boolean,
  }),
  Timestamps,
]);

export type UploadDocument = t.TypeOf<typeof UploadDocument>;

export type GetUploadDocument = (
  id: UploadDocument["id"]
) => TaskEither<Error, O.Option<UploadDocument>>;

export type UpsertUploadDocument = (
  request: UploadDocument
) => TaskEither<Error, UploadDocument>;

export type AddUploadDocument = (
  request: UploadDocument
) => TaskEither<Error, UploadDocument>;

export type MoveUploadDocumentFromBlob = (
  sourceDocumentUrl: string,
  destinationDocumentId: UploadDocument["signatureRequestDocumentId"]
) => TaskEither<Error, string>;

export type DeleteUploadDocumentFromBlob = (
  documentId: UploadDocument["id"]
) => TaskEither<Error, string>;

export type DownloadUploadDocumentFromBlob = (
  documentId: UploadDocument["id"]
) => TaskEither<Error, Buffer>;

export const uploadDocumentNotFoundError = new EntityNotFoundError(
  `Upload document not found`
);
