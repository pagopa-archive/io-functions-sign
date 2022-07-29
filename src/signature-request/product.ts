import * as t from "io-ts";

import { TaskEither } from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

import { Option } from "fp-ts/Option";
import { flow } from "fp-ts/lib/function";

import { map } from "fp-ts/Array";
import { id, Id } from "../id";
import { timestamps, Timestamps } from "../timestamps";
import { EntityNotFoundError } from "../error";
import { SubscriptionId } from "./subscription";
import { DocumentList, DocumentMetadataList } from "./document";

export const ProductId = Id;

export const Product = t.intersection([
  t.type({
    id: ProductId,
    subscriptionId: SubscriptionId,
    documents: DocumentMetadataList,
  }),
  Timestamps,
]);

export type Product = t.TypeOf<typeof Product>;

export type AddProduct = (product: Product) => TaskEither<Error, Product>;

export type GetProduct = (
  id: Product["id"],
  subscriptionId: Product["subscriptionId"]
) => TaskEither<Error, Option<Product>>;

export const getDocumentsByMetadata = flow(
  (product: Product) => product.documents,
  map((metadata) => ({
    id: id(),
    ...metadata,
    ...timestamps(),
  })),
  DocumentList.decode,
  E.mapLeft(() => new Error("Invalid Product"))
);

export const productNotFoundError = new EntityNotFoundError(
  "Product not found"
);
