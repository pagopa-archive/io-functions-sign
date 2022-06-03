import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as RE from "fp-ts/ReaderEither";

import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";
import { sequenceS } from "fp-ts/lib/Apply";

import { pipe, flow } from "fp-ts/function";

import {
  jsonResponse,
  requireBody,
  HttpRequest,
  errorResponse,
  withStatus,
} from "@pagopa/handler-kit/lib/http";

import { BadRequestError } from "@pagopa/handler-kit/lib/http/errors";

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../../app/use-cases/request-signature";

import { DocumentList } from "../../signature-request/document";

import { requireSubscriptionId } from "../http";
import { GetSignerByFiscalCode } from "../../signer/signer";
import { addSignatureRequest } from "../../infra/azure/cosmos/signature-request";

const mockGetSignerByFiscalCode: GetSignerByFiscalCode = (fiscalCode) =>
  TE.right({ id: `Signer-${fiscalCode}` });

const requestSignature = makeRequestSignature(
  mockGetSignerByFiscalCode,
  addSignatureRequest
);

const RequestSignatureBodyPayload = t.type({
  fiscalCode: FiscalCode,
  documents: DocumentList,
});

const requireRequestSignatureBodyPayload = flow(
  requireBody(RequestSignatureBodyPayload),
  E.mapLeft((errors) => failure(errors).join("\n")),
  E.mapLeft((detail) => new BadRequestError(detail))
);

export const requestSignatureDecoder: RE.ReaderEither<
  HttpRequest,
  Error,
  RequestSignaturePayload
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    payload: requireRequestSignatureBodyPayload,
  }),
  RE.map(({ subscriptionId, payload }) => ({
    subscriptionId,
    fiscalCode: payload.fiscalCode,
    documents: payload.documents,
  }))
);

export const run: AzureFunction = pipe(
  createHandler(
    pipe(azure.fromHttpRequest, RTE.chainEitherK(requestSignatureDecoder)),
    requestSignature,
    errorResponse,
    flow(jsonResponse, withStatus(201))
  ),
  azure.unsafeRun
);
