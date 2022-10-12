import * as t from "io-ts";
import * as TE from "fp-ts/TaskEither";
import { ValidationError } from "@pagopa/handler-kit/lib/validation";
import { Document, DocumentId } from "./document";
import { SignatureRequest } from "./signature-request";

export const DocumentSnapshot = t.type({
  documentId: DocumentId,
  snapshot: t.string,
});

export type DocumentSnapshot = t.TypeOf<typeof DocumentSnapshot>;

export type GetDocumentSnapshot = (
  documentId: Document["id"]
) => TE.TaskEither<Error, DocumentSnapshot>;

export type GenerateDocumentSnapshots = (
  request: SignatureRequest
) => TE.TaskEither<Error | ValidationError, SignatureRequest>;
