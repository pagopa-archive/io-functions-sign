import { ContainerClient } from "@azure/storage-blob";

import * as R from "fp-ts/Reader";

import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  DocumentUploadToken,
  GetDocumentUploadToken,
} from "../../../signature-request/upload-token";

import { selectBlob, generateBlobSasUrl } from "./client";

export const makeGetDocumentUploadToken: R.Reader<
  ContainerClient,
  GetDocumentUploadToken
> = (client) => (documentId) =>
  pipe(
    client,
    selectBlob(documentId),
    generateBlobSasUrl(),
    TE.map(
      (token): DocumentUploadToken => ({
        documentId,
        token,
      })
    )
  );
