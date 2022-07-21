import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { flow } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import {
  GetSignatureRequest,
  SignatureRequest,
} from "../../signature-request/signature-request";

import { SendSignatureRequestBody } from "../../infra/azure/functions/send-signature-request";
import { GetProduct, Product } from "../../signature-request/product";
import { GetFiscalCodeBySignerId } from "../../signer/signer";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { sendMessage } from "../../infra/services/send-message";
import { MessageCreatedResponse } from "../../ui/api-models/MessageCreatedResponse";

const makeMessage = (
  signatureRequest: SignatureRequest,
  product: Product
): NewMessage => ({
  content: {
    subject: `Richiesta di firma`,
    markdown: `---\n- SubscriptionId: \`${signatureRequest.subscriptionId}\`\n- SignatureRequestId: \`${signatureRequest.id}\`\n- ProductId: \`${product.id}\`\n- n. documents: \`${signatureRequest.documents.length}\`\n `,
  },
});

const prepareAndSendMessage =
  (getFiscalCodeBySignerId: GetFiscalCodeBySignerId, getProduct: GetProduct) =>
  (
    signatureRequest: SignatureRequest
  ): TE.TaskEither<Error, MessageCreatedResponse> =>
    pipe(
      sequenceS(TE.ApplySeq)({
        signer_cf: getFiscalCodeBySignerId(signatureRequest.signerId),
        product: pipe(
          getProduct(
            signatureRequest.productId,
            signatureRequest.subscriptionId
          ),
          TE.chain(TE.fromOption(() => new Error("Product not found")))
        ),
      }),
      TE.chain(({ signer_cf, product }) =>
        pipe(makeMessage(signatureRequest, product), sendMessage(signer_cf))
      )
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
          TE.chain(prepareAndSendMessage(getFiscalCodeBySignerId, getProduct))
        )
      )
    );
