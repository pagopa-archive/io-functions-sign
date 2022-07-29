import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import * as TE from "fp-ts/TaskEither";
import { Id } from "../id";
import { Timestamps } from "../timestamps";
import { EntityNotFoundError } from "../error";
import { ClauseList } from "./clause";

export const DocumentTitle = NonEmptyString;

export const DocumentMetadata = t.type({
  title: DocumentTitle,
  clauses: ClauseList,
});

export type DocumentMetadata = t.TypeOf<typeof Document>;

interface DocumentMetadataListBrand {
  readonly DocumentMetadataList: unique symbol;
}

export const DocumentMetadataList = t.brand(
  t.array(DocumentMetadata),
  (
    documents
  ): documents is t.Branded<DocumentMetadata[], DocumentMetadataListBrand> =>
    documents.length >= 1,
  "DocumentMetadataList"
);

export type DocumentMetadataList = t.TypeOf<typeof DocumentMetadataList>;

export const DocumentId = Id;

export const Document = t.intersection([
  t.type({
    id: DocumentId,
  }),
  t.partial({
    url: t.string,
  }),
  DocumentMetadata,
  Timestamps,
]);

export type Document = t.TypeOf<typeof Document>;

interface DocumentListBrand {
  readonly DocumentList: unique symbol;
}

export const DocumentList = t.brand(
  t.array(Document),
  (documents): documents is t.Branded<Document[], DocumentListBrand> =>
    documents.length >= 1,
  "DocumentList"
);

export type DocumentList = t.TypeOf<typeof DocumentList>;

export type IsDocumentUploaded = (
  documentId: Document["id"]
) => TE.TaskEither<Error, boolean>;

export const documentNotFoundError = new EntityNotFoundError(
  "Document not found"
);
