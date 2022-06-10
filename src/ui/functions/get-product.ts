import { AzureFunction } from "@azure/functions";

import { pipe, flow } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";

import { createHandler } from "@pagopa/handler-kit";
import {
  jsonResponse,
  HttpRequest,
  errorResponse,
  path,
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";
import {
  BadRequestError,
  NotFoundError,
} from "@pagopa/handler-kit/lib/http/errors";

import { ProductDetailView } from "../api-models/ProductDetailView";
import { requireSubscriptionId } from "../http";

import { Product, ProductId } from "../../signature-request/product";
import { Subscription } from "../../signature-request/subscription";

import { getProduct } from "../../infra/azure/cosmos/product";

export const requireProductId: (
  req: HttpRequest
) => E.Either<Error, Product["id"]> = flow(
  path("productId"),
  E.fromOption(() => new BadRequestError("Missing productId in path")),
  E.chain(
    flow(
      ProductId.decode,
      E.mapLeft(() => new BadRequestError("Invalid productId id"))
    )
  )
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
  TE.chainEitherK(extractGetProductPayload)
);

const encodeSuccessResponse = flow(
  E.fromOption(() => new NotFoundError("Product not found")),
  E.chainW(
    flow(
      ProductDetailView.decode,
      E.mapLeft(() => new Error("Serialization error"))
    )
  ),
  E.fold(errorResponse, jsonResponse)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    ({ productId, subscriptionId }) => getProduct(productId, subscriptionId),
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
