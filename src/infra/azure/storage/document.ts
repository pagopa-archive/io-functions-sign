import * as R from "fp-ts/Reader";
import { pipe } from "fp-ts/lib/function";
import { ContainerClient } from "@azure/storage-blob";
import { IsDocumentUploaded } from "../../../signature-request/document";
import { MoveUploadDocument } from "../../../signature-request/upload-document";
import { blobExists, copyFromUrl, selectBlob } from "./client";

export const makeIsDocumentUploaded: R.Reader<
  ContainerClient,
  IsDocumentUploaded
> = (client) => (documentId) =>
  pipe(client, selectBlob(documentId), blobExists);

export const makeMoveUploadDocument: R.Reader<
  ContainerClient,
  MoveUploadDocument
> = (client) => (sourceDocumentUrl, documentId) =>
  pipe(client, selectBlob(documentId), copyFromUrl(sourceDocumentUrl));
