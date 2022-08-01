import * as t from "io-ts";
import * as TE from "fp-ts/TaskEither";
import { Document, DocumentId } from "./document";

export const DocumentUploadToken = t.type({
  documentId: DocumentId,
  token: t.string,
});

export type DocumentUploadToken = t.TypeOf<typeof DocumentUploadToken>;

export type GetDocumentUploadToken = (
  documentId: Document["id"]
) => TE.TaskEither<Error, DocumentUploadToken>;
