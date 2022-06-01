import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { ClauseList } from "./clause";

export const DocumentTitle = NonEmptyString;

export const Document = t.type({
  id: t.string,
  title: DocumentTitle,
  clauses: ClauseList,
});

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
