import * as t from "io-ts";

import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { SignatureRequest } from "../../signature-request/signature-request";

import { SendSignatureRequestBody } from "../../infra/azure/functions/send-signature-request";
import { getSignatureRequest } from "../../infra/azure/cosmos/signature-request";
export const MessageSubject = NonEmptyString;
export const MessageMarkdown = NonEmptyString;

export const ContentMessage = t.type({
  subject: MessageSubject,
  markdown: MessageMarkdown,
});

export const MessagePayload = t.type({
  content: ContentMessage,
});

export type MessagePayload = t.TypeOf<typeof MessagePayload>;
/*
export const makeRequestSignature =
  (getFiscalCodeBySignerId: GetFiscalCodeBySignerId, getProduct: GetProduct) =>
  (payload: SignatureRequest): TE.TaskEither<Error, MessagePayload> =>
    pipe(
      sequenceS(TE.ApplySeq)({
        signer_cf: getFiscalCodeBySignerId(payload.signerId),
        product: pipe(
          getProduct(payload.productId, payload.subscriptionId),
          TE.chain(TE.fromOption(() => new ProductNotFoundError()))
        ),
      }),
      TE.map(
        ({ signer_cf, product }): MessagePayload => ({
          content: {
            subject: "a",
            markdown: "a",
          },
        })
      )
    );
*/
export const sendSignatureRequest = (
  sendSignatureRequestBody: SendSignatureRequestBody
): TE.TaskEither<Error, SignatureRequest> =>
  pipe(
    getSignatureRequest(
      sendSignatureRequestBody.id,
      sendSignatureRequestBody.subscriptionId
    ),
    (_) => TE.left(new Error("Not yet implemented"))
  );
