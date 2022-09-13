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
  body,
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { validate } from "@pagopa/handler-kit/lib/validation";
import { requireSubscriptionId } from "../../http";

import { Subscription } from "../../../signature-request/subscription";

import {
  SignatureRequest,
  SignatureRequestId,
  SignatureRequestStatus,
} from "../../../signature-request/signature-request";
import { upsertSignatureRequest } from "../cosmos/signature-request";
import { SignatureRequestDetailView } from "../../api-models/SignatureRequestDetailView";
import { PatchSignatureStatusBody } from "../../api-models/PatchSignatureStatusBody";
import { updateStatusRequestSignature } from "../../../app/use-cases/request-signature";

const updateStatus = updateStatusRequestSignature(upsertSignatureRequest);

export const requireSignatureRequestId: (
  req: HttpRequest
) => E.Either<Error, SignatureRequest["id"]> = flow(
  path("signatureRequestId"),
  E.fromOption(() => new Error("Missing signatureRequestId in path")),
  E.chainW(validate(SignatureRequestId, "Invalid signatureRequestId in path"))
);

const requireSignatureRequestStatus = (
  req: HttpRequest
): E.Either<Error, SignatureRequestStatus> =>
  pipe(
    req,
    body(PatchSignatureStatusBody),
    E.map((body) => body.status)
  );

export const extractPatchSignatureRequestPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  {
    subscriptionId: Subscription["id"];
    signatureRequestId: SignatureRequest["id"];
    signatureRequestStatus: SignatureRequest["status"];
  }
> = pipe(
  sequenceS(RE.Apply)({
    subscriptionId: requireSubscriptionId,
    signatureRequestId: requireSignatureRequestId,
    signatureRequestStatus: requireSignatureRequestStatus,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.fromEither,
  TE.chainEitherK(extractPatchSignatureRequestPayload)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    updateStatus,
    error,
    success(SignatureRequestDetailView)
  ),
  azure.unsafeRun
);
