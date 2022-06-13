import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import {
  jsonResponse,
  HttpRequest,
  withStatus,
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { badRequestError } from "@pagopa/handler-kit/lib/http/errors";

import { failure } from "io-ts/PathReporter";

import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";

import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import {
  CreateProductPayload,
  makeCreateProduct,
} from "../../app/use-cases/create-product";

import { requireSubscriptionId, errorResponse } from "../http";
import { CreateProductBody } from "../api-models/CreateProductBody";

import { DocumentMetadataList } from "../../signature-request/document";
import { addProduct } from "../../infra/azure/cosmos/product";
import { ProductDetailView } from "../api-models/ProductDetailView";

const createProduct = makeCreateProduct(addProduct);

const requireDocumentsMetadata = (
  req: HttpRequest
): E.Either<Error, DocumentMetadataList> =>
  pipe(
    CreateProductBody.decode(req.body),
    E.map((body) => body.documents),
    E.chain(DocumentMetadataList.decode),
    E.mapLeft(flow(failure, (errors) => errors.join("\n"), badRequestError))
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
  TE.chainEitherK(extractCreateProductPayload)
);

const encodeSuccessResponse = flow(
  ProductDetailView.decode,
  E.mapLeft(() => new Error("Serialization error")),
  E.fold(errorResponse, flow(jsonResponse, withStatus(201)))
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    createProduct,
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
