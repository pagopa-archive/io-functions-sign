import { AzureFunction } from "@azure/functions";

import { pipe, flow } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";

import { createHandler } from "@pagopa/handler-kit";
import {
  success,
  HttpRequest,
  path,
  error,
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { validate } from "@pagopa/handler-kit/lib/validation";
import { ProductDetailView } from "../api-models/ProductDetailView";
import { requireSubscriptionId } from "../http";

import {
  Product,
  ProductId,
  productNotFoundError,
} from "../../signature-request/product";
import { Subscription } from "../../signature-request/subscription";

import { getProduct } from "../../infra/azure/cosmos/product";

export const requireProductId: (
  req: HttpRequest
) => E.Either<Error, Product["id"]> = flow(
  path("productId"),
  E.fromOption(() => new Error("Missing productId in path")),
  E.chainW(validate(ProductId, "Invalid ProductId in path"))
);

export const extractGetProductPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  { subscriptionId: Subscription["id"]; productId: Product["id"] }
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    productId: requireProductId,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.fromEither,
  TE.chainEitherK(extractGetProductPayload)
);

const encodeSuccessResponse = flow(
  E.fromOption(() => productNotFoundError),
  E.fold(error, success(ProductDetailView))
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    ({ productId, subscriptionId }) => getProduct(productId, subscriptionId),
    error,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
