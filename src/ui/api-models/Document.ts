/**
 * Do not edit this file it is auto-generated by io-utils / gen-api-models.
 * See https://github.com/pagopa/io-utils
 */
/* eslint-disable  */

import * as t from "io-ts";
import { DocumentMetadata } from "./DocumentMetadata";

// required attributes
const Document1R = t.interface({
  id: t.string,
});

// optional attributes
const Document1O = t.partial({
  url: t.string,
});

export const Document1 = t.exact(
  t.intersection([Document1R, Document1O], "Document1")
);

export type Document1 = t.TypeOf<typeof Document1>;

export const Document = t.intersection(
  [Document1, DocumentMetadata],
  "Document"
);

export type Document = t.TypeOf<typeof Document>;