import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";

import { NewMessage } from "@pagopa/io-functions-services-sdk/NewMessage";
import {
  GetSignatureRequest,
  SignatureRequest,
  signatureRequestNotFoundError,
} from "../../signature-request/signature-request";

import { SendSignatureRequestBody } from "../../infra/azure/functions/send-signature-request-message";
import {
  GetProduct,
  Product,
  productNotFoundError,
} from "../../signature-request/product";
import { GetFiscalCodeBySignerId } from "../../signer/signer";

import { submitMessageForUser } from "../../infra/IOApiClient/send-message";

const mockMakeMessage = (
  signatureRequest: SignatureRequest,
  product: Product
): NewMessage => ({
  content: {
    subject: `Richiesta di firma`,
    markdown: `---\n- SubscriptionId: \`${
      signatureRequest.subscriptionId
    }\`\n- SignatureRequestId: \`${signatureRequest.id}\`\n- ProductId: \`${
      product.id
    }\`\n- n. documents: \`${
      signatureRequest.documents.length
    }\`\n- expiresAt: \`${
      signatureRequest.expiresAt ? signatureRequest.expiresAt : "never"
    }\`\n- docs: \`${JSON.stringify(signatureRequest.documents)}\`\n `,
  },
});

export const prepareMessage =
  (getProduct: GetProduct) =>
  (signatureRequest: SignatureRequest): TE.TaskEither<Error, NewMessage> =>
    pipe(
      getProduct(signatureRequest.productId, signatureRequest.subscriptionId),
      TE.chainW(TE.fromOption(() => productNotFoundError)),
      TE.map((product) => mockMakeMessage(signatureRequest, product))
    );

export const sendSignatureRequest =
  (
    getSignatureRequest: GetSignatureRequest,
    getFiscalCodeBySignerId: GetFiscalCodeBySignerId,
    getProduct: GetProduct
  ) =>
  (sendSignatureRequestBody: SendSignatureRequestBody) =>
    pipe(
      getSignatureRequest(
        sendSignatureRequestBody.signatureRequestId,
        sendSignatureRequestBody.subscriptionId
      ),
      TE.chainW(
        flow(
          TE.fromOption(() => signatureRequestNotFoundError),
          TE.chain((signatureRequest) =>
            pipe(
              signatureRequest,
              prepareMessage(getProduct),
              TE.chain((message) =>
                pipe(
                  signatureRequest.signerId,
                  getFiscalCodeBySignerId,
                  TE.chain(submitMessageForUser(message))
                )
              )
            )
          )
        )
      ),
      TE.map(() => void 0)
    );
