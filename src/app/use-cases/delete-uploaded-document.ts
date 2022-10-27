import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import {
  DeleteUploadDocument,
  DeleteUploadDocumentFromBlob,
  UploadDocument,
} from "../../signature-request/upload-document";

export const makeDeleteUploadedDocument =
  (
    deleteDocumentUploadedFromBlobStorage: DeleteUploadDocumentFromBlob,
    deleteUploadDocument: DeleteUploadDocument
  ) =>
  (payload: UploadDocument) =>
    pipe(
      deleteDocumentUploadedFromBlobStorage(payload.id),
      TE.chain(() => pipe(payload.id, deleteUploadDocument))
    );
