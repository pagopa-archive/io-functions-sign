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
import {
  SignatureRequest,
  SignatureRequestList,
} from "../../../signature-request/signature-request";
import { SignatureRequestDetailView } from "../../../ui/api-models/SignatureRequestDetailView";
import { sendSignatureRequest } from "../../../app/use-cases/send-signature";

const getFirstSignatureRequest = (
  req: HttpRequest
): E.Either<Error, SignatureRequest> =>
  pipe(
    SignatureRequestList.decode(req.body),
    E.map((sr) => sr[0]),
    E.mapLeft(flow(failure, (errors) => errors.join("\n"), badRequestError))
  );

export const extractSignatureRequestListPayload: RE.ReaderEither<
  HttpRequest,
  Error,
  { signatureRequest: SignatureRequest }
> = pipe(
  sequenceS(RE.Apply)({
    signatureRequest: getFirstSignatureRequest,
  })
);

const decodeRequest = flow(
  azure.fromHttpRequest,
  TE.chainEitherK(extractSignatureRequestListPayload)
);

const encodeSuccessResponse = flow(
  SignatureRequestDetailView.decode,
  E.mapLeft(() => new Error("Serialization error")),
  E.fold(errorResponse, jsonResponse)
);

export const run: AzureFunction = pipe(
  createHandler(
    decodeRequest,
    ({ signatureRequest }) => sendSignatureRequest(signatureRequest),
    errorResponse,
    encodeSuccessResponse
  ),
  azure.unsafeRun
);
