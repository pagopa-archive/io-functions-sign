import * as R from "fp-ts/Reader";
import { pipe } from "fp-ts/function";

import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
} from "@azure/storage-blob";
import { Document } from "../document";

export const getForDocument = (document: Document) =>
  pipe(
    R.ask<StorageSharedKeyCredential>(),
    R.map((storageSharedKeyCredential) =>
      generateBlobSASQueryParameters(
        {
          containerName: "my-container",
          blobName: document.id,
          permissions: ContainerSASPermissions.parse("write"),
          expiresOn: pipe(new Date(), (expiryDate) => {
            expiryDate.setHours(expiryDate.getHours() + 2);
            return expiryDate;
          }),
        },
        storageSharedKeyCredential
      )
    ),
    R.map((sasKey) => ({
      document,
      url: sasKey.toString(),
    }))
  );
