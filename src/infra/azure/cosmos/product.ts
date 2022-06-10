import { pipe } from "fp-ts/function";

import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

import {
  BaseModel,
  CosmosdbModel,
  CosmosResource,
} from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";

import * as t from "io-ts";
import { Container } from "@azure/cosmos";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import {
  Product,
  AddProduct,
  GetProduct,
} from "../../../signature-request/product";

import { container } from "./database";

const containerId = "products";
const partitionKey = "subscriptionId";

const NewProduct = t.intersection([Product, BaseModel]);

type NewProduct = t.TypeOf<typeof NewProduct>;

const RetrievedProduct = t.intersection([Product, CosmosResource]);

type RetrievedProduct = t.TypeOf<typeof RetrievedProduct>;

class ProductModel extends CosmosdbModel<
  Product,
  NewProduct,
  RetrievedProduct,
  typeof partitionKey
> {
  constructor(container: Container) {
    super(container, NewProduct, RetrievedProduct);
  }
}

const productModel = pipe(
  container(containerId),
  E.map((c) => new ProductModel(c))
);

const productModelTE = TE.fromEither(productModel);

export const addProduct: AddProduct = (product) =>
  pipe(
    NewProduct.decode(product),
    E.mapLeft(() => new Error("invalid product")),
    TE.fromEither,
    TE.chain((newProduct) =>
      pipe(
        productModelTE,
        TE.chain((model) =>
          pipe(
            model.create(newProduct),
            TE.mapLeft(() => new Error("error creating the product"))
          )
        )
      )
    )
  );

export const getProduct: GetProduct = (id, subscriptionId) =>
  pipe(
    NonEmptyString.decode(id),
    E.mapLeft(() => new Error("invalid id")),
    TE.fromEither,
    TE.chain((id) =>
      pipe(
        productModelTE,
        TE.chain((model) =>
          pipe(
            model.find([id, subscriptionId]),
            TE.mapLeft(() => new Error("error getting the product"))
          )
        )
      )
    )
  );
