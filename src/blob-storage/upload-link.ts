import * as TE from "fp-ts/TaskEither";
import { Document } from "../document";
import { UploadLinkInteractor } from "../upload-link";

import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
} from "@azure/storage-blob";

export type AzureBlobStorageCredentials = {
  accountName: string;
  accountKey: string;
};

export class BlobStorageUploadLinkInteractor implements UploadLinkInteractor {
  private storageSharedKeyCredential: StorageSharedKeyCredential;

  constructor({ accountName, accountKey }: AzureBlobStorageCredentials) {
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
  }

  getForDocument(document: Document) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);

    const sasKey = generateBlobSASQueryParameters(
      {
        containerName: "my-container",
        blobName: document.id,
        permissions: ContainerSASPermissions.parse("write"),
        expiresOn: expiryDate,
      },
      this.storageSharedKeyCredential
    );

    return TE.right({
      document,
      url: sasKey.toString(),
    });
  }
}
