import * as TE from "fp-ts/TaskEither";
import { identity, pipe } from "fp-ts/function";

import {
  DeleteUploadDocument,
  UploadDocument,
} from "../../signature-request/upload-document";

export const makeDeleteUploadedDocument =
  (deleteDocumentUploadedFromBlobStorage: DeleteUploadDocument) =>
  (payload: UploadDocument) =>
    pipe(
      deleteDocumentUploadedFromBlobStorage(payload.id),
      TE.filterOrElse(identity, (): Error => new Error("Unable to delete file"))
    );
