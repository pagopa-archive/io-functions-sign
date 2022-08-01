import {
  BlobSASPermissions,
  ContainerClient,
  SASProtocol,
  BlobClient,
} from "@azure/storage-blob";

import * as TE from "fp-ts/TaskEither";

import { addMinutes } from "date-fns";

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
