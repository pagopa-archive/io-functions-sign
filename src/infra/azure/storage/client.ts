import {
  BlobSASPermissions,
  ContainerClient,
  SASProtocol,
  BlobClient,
} from "@azure/storage-blob";

import * as TE from "fp-ts/TaskEither";

import { addMinutes } from "date-fns";
import { pipe } from "fp-ts/lib/function";

export const createContainerClient = (
  connectionString: string,
  containerName: string
) => new ContainerClient(connectionString, containerName);

export const selectBlob =
  (blobName: string) => (containerClient: ContainerClient) =>
    containerClient.getBlobClient(blobName);

export const blobExists = (blobClient: BlobClient) =>
  TE.tryCatch(
    () => blobClient.exists(),
    () => new Error("The specified blob does not exists")
  );

export const generateBlobSasUrl =
  (durationInMinutes: number = 15) =>
  (blobClient: BlobClient) =>
    TE.tryCatch(
      () =>
        blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse("racw"),
          startsOn: new Date(),
          expiresOn: addMinutes(new Date(), durationInMinutes),
          contentType: "application/pdf",
          protocol: SASProtocol.HttpsAndHttp,
        }),
      () => new Error("Unable to generate the blob sas url")
    );

export const copyFromUrl = (sourceUrl: string) => (blobClient: BlobClient) =>
  pipe(
    TE.tryCatch(
      () => blobClient.beginCopyFromURL(sourceUrl),
      () => new Error("Unable to start blob copy")
    ),
    TE.chain((copyPoller) =>
      TE.tryCatch(
        () => copyPoller.pollUntilDone(),
        () => new Error("Unable to poll blob copy")
      )
    ),
    TE.filterOrElse(
      (response) => response.copyStatus === "success",
      (response) =>
        new Error(
          `Unable to copy blob! Current status is ${response.copyStatus}`
        )
    ),
    TE.map(() => blobClient.url)
  );

export const blobDelete = (blobClient: BlobClient) =>
  pipe(
    TE.tryCatch(
      () => blobClient.deleteIfExists(),
      () => new Error("Unable to delete blob!")
    ),
    TE.filterOrElse(
      (response) => response.succeeded === true,
      () => new Error("The specified blob does not exists")
    ),
    TE.map(() => blobClient.name)
  );
