import * as t from "io-ts";

import { AzureFunction } from "@azure/functions";

import { createHandler } from "@pagopa/handler-kit";
import { jsonResponse, HttpRequest } from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { badRequestError } from "@pagopa/handler-kit/lib/http/errors";

import { failure } from "io-ts/PathReporter";

import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";

import * as RE from "fp-ts/lib/ReaderEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { errorResponse } from "../../../ui/http";
import { SignatureRequestId } from "../../../signature-request/signature-request";
import { SignatureRequestDetailView } from "../../../ui/api-models/SignatureRequestDetailView";
import { sendSignatureRequest } from "../../../app/use-cases/send-signature-request";
import { SubscriptionId } from "../../../signature-request/subscription";

export const SendSignatureRequestBody = t.type({
  id: SignatureRequestId,
  subscriptionId: SubscriptionId,
});
export type SendSignatureRequestBody = t.TypeOf<
  typeof SendSignatureRequestBody
>;

const getSignatureRequestBody = (
  req: HttpRequest
): E.Either<Error, SendSignatureRequestBody> =>
  pipe(
    SendSignatureRequestBody.decode(req.body),
    E.mapLeft(flow(failure, (errors) => errors.join("\n"), badRequestError))
  );

export const extractSignatureRequestPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  { sendSignatureRequestBody: SendSignatureRequestBody }
> = pipe(
  sequenceS(RE.Apply)({
    sendSignatureRequestBody: getSignatureRequestBody,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.chainEitherK(extractSignatureRequestPayload)
);

const encodeSuccessResponse = flow(
  SignatureRequestDetailView.decode,
  E.mapLeft(() => new Error("Serialization error")),
  E.fold(errorResponse, jsonResponse)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    ({ sendSignatureRequestBody }) =>
      sendSignatureRequest(sendSignatureRequestBody),
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
