import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as RE from "fp-ts/ReaderEither";

import { failure } from "io-ts/PathReporter";
import { sequenceS } from "fp-ts/lib/Apply";

import { pipe, flow } from "fp-ts/function";

import {
  jsonResponse,
  HttpRequest,
  withStatus,
} from "@pagopa/handler-kit/lib/http";

import { badRequestError } from "@pagopa/handler-kit/lib/http/errors";

import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../../app/use-cases/request-signature";

import { requireSubscriptionId, errorResponse } from "../http";
import { GetSignerByFiscalCode } from "../../signer/signer";
import { addSignatureRequest } from "../../infra/azure/cosmos/signature-request";
import { RequestSignatureBody } from "../api-models/RequestSignatureBody";
import { getProduct } from "../../infra/azure/cosmos/product";
import { SignatureRequestDetailView } from "../api-models/SignatureRequestDetailView";

const mockGetSignerByFiscalCode: GetSignerByFiscalCode = (fiscalCode) =>
  TE.right({ id: `Signer-${fiscalCode}` });

const requestSignature = makeRequestSignature(
  mockGetSignerByFiscalCode,
  getProduct,
  addSignatureRequest
);

const requireRequestSignatureBody = (
  req: HttpRequest
): E.Either<Error, RequestSignatureBody> =>
  pipe(
    RequestSignatureBody.decode(req.body),
    E.mapLeft(flow(failure, (errors) => errors.join("\n"), badRequestError))
  );

export const extractRequestSignaturePayload: RE.ReaderEither<
  HttpRequest,
  Error,
  RequestSignaturePayload
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    payload: requireRequestSignatureBody,
  }),
  RE.map(({ subscriptionId, payload }) => ({
    subscriptionId,
    expiryAt: payload.expiryAt,
    fiscalCode: payload.fiscalCode,
    productId: payload.productId,
  }))
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.chainEitherK(extractRequestSignaturePayload)
);

const encodeSuccessResponse = flow(
  SignatureRequestDetailView.decode,
  E.mapLeft(() => new Error("Serialization error")),
  E.fold(errorResponse, flow(jsonResponse, withStatus(201)))
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    requestSignature,
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
