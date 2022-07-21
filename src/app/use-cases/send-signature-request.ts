import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { flow } from "fp-ts/function";

import {
  GetSignatureRequest,
  SignatureRequest,
} from "../../signature-request/signature-request";

import { SendSignatureRequestBody } from "../../infra/azure/functions/send-signature-request";
import { GetProduct, Product } from "../../signature-request/product";
import { GetFiscalCodeBySignerId } from "../../signer/signer";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { submitMessageForUser } from "../../infra/services/send-message";
import { MessageCreatedResponse } from "../../ui/api-models/MessageCreatedResponse";

const makeMessageMock = (
  signatureRequest: SignatureRequest,
  product: Product
): NewMessage => ({
  content: {
    subject: `Richiesta di firma`,
    markdown: `---\n- SubscriptionId: \`${signatureRequest.subscriptionId}\`\n- SignatureRequestId: \`${signatureRequest.id}\`\n- ProductId: \`${product.id}\`\n- n. documents: \`${signatureRequest.documents.length}\`\n `,
  },
});

const prepareMessage =
  (getProduct: GetProduct) =>
  (signatureRequest: SignatureRequest): TE.TaskEither<Error, NewMessage> =>
    pipe(
      getProduct(signatureRequest.productId, signatureRequest.subscriptionId),
      TE.chain(TE.fromOption(() => new Error("Product not found"))),
      TE.map((product) => makeMessageMock(signatureRequest, product))
    );

const sendMessage =
  (getFiscalCodeBySignerId: GetFiscalCodeBySignerId) =>
  (message: NewMessage) =>
  (
    signatureRequest: SignatureRequest
  ): TE.TaskEither<Error, MessageCreatedResponse> =>
    pipe(
      getFiscalCodeBySignerId(signatureRequest.signerId),
      TE.map(submitMessageForUser(message))
    );

export const sendSignatureRequest =
  (
    getSignatureRequest: GetSignatureRequest,
    getFiscalCodeBySignerId: GetFiscalCodeBySignerId,
    getProduct: GetProduct
  ) =>
  (
    sendSignatureRequestBody: SendSignatureRequestBody
  ): TE.TaskEither<Error, MessageCreatedResponse> =>
    pipe(
      getSignatureRequest(
        sendSignatureRequestBody.id,
        sendSignatureRequestBody.subscriptionId
      ),
      TE.chain(
        flow(
          TE.fromOption(() => new Error("Signature Request not found")),
          TE.chain(
            flow(
              prepareMessage(getProduct),
              TE.map(sendMessage(getFiscalCodeBySignerId))
            )
          )
        )
      )
    );
