import * as TE from "fp-ts/TaskEither";
import { identity, pipe } from "fp-ts/function";

import {
  DeleteUploadDocument,
  GetUploadDocument,
  UploadDocument,
  UpsertUploadDocument,
} from "../../signature-request/upload-document";

export const makeDeleteUploadedDocument =
  (
    getUploadDocument: GetUploadDocument,
    deleteDocumentUploadedFromBlobStorage: DeleteUploadDocument,
    upsertUploadDocument: UpsertUploadDocument
  ) =>
  (payload: UploadDocument) =>
    pipe(
      deleteDocumentUploadedFromBlobStorage(payload.id),
      TE.filterOrElse(
        identity,
        (): Error => new Error("Unable to delete file")
      ),
      TE.chain(() =>
        pipe(
          getUploadDocument(payload.id),
          TE.chain(
            TE.fromOption((): Error => new Error("Upload document not found"))
          ),
          TE.map((uploadDocument) => ({ ...uploadDocument, deleted: true })),
          TE.chain(upsertUploadDocument)
        )
      )
    );
