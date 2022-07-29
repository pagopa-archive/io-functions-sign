import * as R from "fp-ts/Reader";

import { pipe } from "fp-ts/lib/function";
import { ContainerClient } from "@azure/storage-blob";
import { IsDocumentUploaded } from "../../../signature-request/document";
import { blobExists, selectBlob } from "./client";

export const makeIsDocumentUploaded: R.Reader<
  ContainerClient,
  IsDocumentUploaded
> = (client) => (documentId) =>
  pipe(client, selectBlob(documentId), blobExists);
