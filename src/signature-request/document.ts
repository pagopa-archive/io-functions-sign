import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { Id } from "../id";
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

export const Document = t.intersection([
  t.type({
    id: Id,
  }),
  DocumentMetadata,
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
