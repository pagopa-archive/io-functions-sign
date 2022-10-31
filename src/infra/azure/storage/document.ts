import * as R from "fp-ts/Reader";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ContainerClient } from "@azure/storage-blob";
import { IsDocumentUploaded } from "../../../signature-request/document";
import {
  DeleteUploadDocumentFromBlob,
  MoveUploadDocumentFromBlob,
  DownloadUploadDocumentFromBlob,
} from "../../../signature-request/upload-document";
import { blobDelete, blobExists, copyFromUrl, selectBlob } from "./client";

export const makeIsDocumentUploaded: R.Reader<
  ContainerClient,
  IsDocumentUploaded
> = (client) => (documentId) =>
  pipe(client, selectBlob(documentId), blobExists);

export const makeMoveUploadDocument: R.Reader<
  ContainerClient,
  MoveUploadDocumentFromBlob
> = (client) => (sourceDocumentUrl, documentId) =>
  pipe(client, selectBlob(documentId), copyFromUrl(sourceDocumentUrl));

export const makeDeleteDocumentUploaded: R.Reader<
  ContainerClient,
  DeleteUploadDocumentFromBlob
> = (client) => (documentId) =>
  pipe(client, selectBlob(documentId), blobDelete);

export const makeDownloadDocumentUploaded: R.Reader<
  ContainerClient,
  DownloadUploadDocumentFromBlob
> = (client) => (documentId) =>
  pipe(client, selectBlob(documentId), (blob) =>
    TE.tryCatch(
      () => blob.downloadToBuffer(),
      () => new Error("The blob cannot be downloaded.")
    )
  );
