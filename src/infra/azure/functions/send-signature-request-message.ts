import * as t from "io-ts";

import { createHandler } from "@pagopa/handler-kit";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { pipe, identity } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as TE from "fp-ts/lib/TaskEither";

import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { SignatureRequestId } from "../../../signature-request/signature-request";
import { sendSignatureRequest } from "../../../app/use-cases/send-signature-request";
import { SubscriptionId } from "../../../signature-request/subscription";
import { getSignatureRequest } from "../cosmos/signature-request";
import { GetFiscalCodeBySignerId } from "../../../signer/signer";
import { getProduct } from "../cosmos/product";

const mockGetFiscalCodeBySignerId: GetFiscalCodeBySignerId = (signerId) =>
  pipe(
    signerId,
    S.replace("Signer-", ""),
    FiscalCode.decode,
    TE.fromEither,
    TE.mapLeft(() => new Error("Invalid fiscal code"))
  );

const sendSignature = sendSignatureRequest(
  getSignatureRequest,
  mockGetFiscalCodeBySignerId,
  getProduct
);

export const SendSignatureRequestBody = t.type({
  signatureRequestId: SignatureRequestId,
  subscriptionId: SubscriptionId,
});
export type SendSignatureRequestBody = t.TypeOf<
  typeof SendSignatureRequestBody
>;

export const run = pipe(
  createHandler(
    (ctx) =>
      pipe(
        ctx.bindingData.queueTrigger,
        validate(
          SendSignatureRequestBody,
          "Unable to validate the Queue Message schema"
        ),
        TE.fromEither
      ),
    (dequeuedMessage) => sendSignature(dequeuedMessage),
    identity,
    identity
  ),
  azure.unsafeRun
);
