import { ContainerClient, BlobClient } from "@azure/storage-blob";

import * as TE from "fp-ts/TaskEither";
import * as R from "fp-ts/Reader";

import { pipe } from "fp-ts/lib/function";
import {
  DocumentSnapshot,
  GetDocumentSnapshot,
} from "../../../signature-request/snapshot";
import { selectBlob } from "./client";

const generateSnapshot = (blobClient: BlobClient) =>
  pipe(
    TE.tryCatch(
      () => blobClient.createSnapshot(),
      () => new Error("Unable to generate a snapshot")
    ),
    TE.chain((response) =>
      pipe(
        response.snapshot,
        TE.fromNullable(new Error("Unable to generate a snapshot"))
      )
    )
  );

export const makeGetDocumentSnapshot: R.Reader<
  ContainerClient,
  GetDocumentSnapshot
> = (client) => (documentId) =>
  pipe(
    client,
    selectBlob(documentId),
    generateSnapshot,
    TE.map(
      (snapshot): DocumentSnapshot => ({
        documentId,
        snapshot,
      })
    )
  );
