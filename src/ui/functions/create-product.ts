import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import {
  HttpRequest,
  created,
  error,
  body,
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";

import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import {
  CreateProductPayload,
  makeCreateProduct,
} from "../../app/use-cases/create-product";

import { requireSubscriptionId } from "../http";
import { CreateProductBody } from "../api-models/CreateProductBody";

import { DocumentMetadataList } from "../../signature-request/document";
import { addProduct } from "../../infra/azure/cosmos/product";
import { ProductDetailView } from "../api-models/ProductDetailView";

import { validate } from "@pagopa/handler-kit/lib/error";

const createProduct = makeCreateProduct(addProduct);

const requireDocumentsMetadata = (
  req: HttpRequest
): E.Either<Error, DocumentMetadataList> =>
  pipe(
    req,
    body(CreateProductBody),
    E.map((body) => body.documents),
    E.chain(
      validate(
        DocumentMetadataList,
        "Unable to decode the document metadata list"
      )
    )
  );

export const extractCreateProductPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  CreateProductPayload
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    documents: requireDocumentsMetadata,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.fromEither,
  TE.chainEitherK(extractCreateProductPayload)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    createProduct,
    error,
    created(ProductDetailView)
  ),
  azure.unsafeRun
);
