import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import {
  DeleteUploadDocumentFromBlob,
  GetUploadDocument,
  UploadDocument,
  uploadDocumentNotFoundError,
  UpsertUploadDocument,
} from "../../signature-request/upload-document";

export const makeDeleteUploadedDocument =
  (
    getUploadDocument: GetUploadDocument,
    deleteDocumentUploadedFromBlobStorage: DeleteUploadDocumentFromBlob,
    upsertUploadDocument: UpsertUploadDocument
  ) =>
  (payload: UploadDocument) =>
    pipe(
      deleteDocumentUploadedFromBlobStorage(payload.id),
      TE.chain(() =>
        pipe(
          getUploadDocument(payload.id),
          TE.chain(TE.fromOption((): Error => uploadDocumentNotFoundError)),
          TE.map((uploadDocument) => ({ ...uploadDocument, validated: true })),
          TE.chain(upsertUploadDocument)
        )
      )
    );
