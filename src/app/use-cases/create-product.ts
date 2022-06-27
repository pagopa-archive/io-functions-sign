import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { DocumentMetadataList } from "../../signature-request/document";
import { Subscription } from "../../signature-request/subscription";
import { AddProduct, Product } from "../../signature-request/product";

import { id } from "../../id";
import { timestamps } from "../../timestamps";

export type CreateProductPayload = {
  subscriptionId: Subscription["id"];
  documents: DocumentMetadataList;
};

export const makeCreateProduct =
  (addProduct: AddProduct) =>
  (payload: CreateProductPayload): TE.TaskEither<Error, Product> =>
    pipe(
      TE.right({
        id: id(),
        subscriptionId: payload.subscriptionId,
        documents: payload.documents,
        ...timestamps(),
      }),
      TE.chainFirst(addProduct)
    );
