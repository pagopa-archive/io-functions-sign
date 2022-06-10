import { AzureFunction } from "@azure/functions";

import { pipe, flow } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";

import { createHandler } from "@pagopa/handler-kit";
import { jsonResponse, HttpRequest, path } from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";
import {
  BadRequestError,
  NotFoundError,
} from "@pagopa/handler-kit/lib/http/errors";

import { requireSubscriptionId, errorResponse } from "../http";

import { Subscription } from "../../signature-request/subscription";

import {
  SignatureRequest,
  SignatureRequestId,
} from "../../signature-request/signature-request";
import { getSignatureRequest } from "../../infra/azure/cosmos/signature-request";
import { SignatureRequestDetailView } from "../api-models/SignatureRequestDetailView";

export const requireSignatureRequestId: (
  req: HttpRequest
) => E.Either<Error, SignatureRequest["id"]> = flow(
  path("signatureRequestId"),
  E.fromOption(() => new BadRequestError("Missing signatureRequestId in path")),
  E.chain(
    flow(
      SignatureRequestId.decode,
      E.mapLeft(() => new BadRequestError("Invalid signatureRequestId id"))
    )
  )
);

export const extractGetSignatureRequestPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  {
    subscriptionId: Subscription["id"];
    signatureRequestId: SignatureRequest["id"];
  }
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    signatureRequestId: requireSignatureRequestId,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.chainEitherK(extractGetSignatureRequestPayload)
);

const encodeSuccessResponse = flow(
  E.fromOption(() => new NotFoundError("Signature Request not found")),
  E.chainW(
    flow(
      SignatureRequestDetailView.decode,
      E.mapLeft(() => new Error("Serialization error"))
    )
  ),
  E.fold(errorResponse, jsonResponse)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    ({ signatureRequestId, subscriptionId }) =>
      getSignatureRequest(signatureRequestId, subscriptionId),
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
