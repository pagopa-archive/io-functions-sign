import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as RE from "fp-ts/ReaderEither";

import { sequenceS } from "fp-ts/lib/Apply";

import { pipe, flow } from "fp-ts/function";

import {
  created,
  body,
  HttpRequest,
  error,
} from "@pagopa/handler-kit/lib/http";

import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../../../app/use-cases/request-signature";

import { requireSubscriptionId } from "../../http";
import { GetSignerByFiscalCode } from "../../../signer/signer";
import { addSignatureRequest } from "../cosmos/signature-request";
import { RequestSignatureBody } from "../../../generated/RequestSignatureBody";
import { getProduct } from "../cosmos/product";
import { SignatureRequestDetailView } from "../../../generated/SignatureRequestDetailView";

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
  pipe(req, body(RequestSignatureBody));

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
    expiresAt: payload.expiresAt,
    fiscalCode: payload.fiscalCode,
    productId: payload.productId,
  }))
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.fromEither,
  TE.chainEitherK(extractRequestSignaturePayload)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    requestSignature,
    error,
    created(SignatureRequestDetailView)
  ),
  azure.unsafeRun
);
