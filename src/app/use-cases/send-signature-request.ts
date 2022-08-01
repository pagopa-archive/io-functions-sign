import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

import {
  GetSignatureRequest,
  SignatureRequest,
  signatureRequestNotFoundError,
} from "../../signature-request/signature-request";

import { SendSignatureRequestBody } from "../../infra/azure/functions/send-signature-request";
import {
  GetProduct,
  Product,
  productNotFoundError,
} from "../../signature-request/product";
import { GetFiscalCodeBySignerId } from "../../signer/signer";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { submitMessageForUser } from "../../infra/services/send-message";
import { CreatedMessage } from "../../ui/api-models/CreatedMessage";

const makeMessage = (
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
      signatureRequest.expiresAt ? signatureRequest.expiresAt : "Not defined"
    }\`\n `,
  },
});

const prepareAndSendMessage =
  (getFiscalCodeBySignerId: GetFiscalCodeBySignerId, getProduct: GetProduct) =>
  (signatureRequest: SignatureRequest): TE.TaskEither<Error, CreatedMessage> =>
    pipe(
      sequenceS(TE.ApplySeq)({
        signer_cf: getFiscalCodeBySignerId(signatureRequest.signerId),
        product: pipe(
          getProduct(
            signatureRequest.productId,
            signatureRequest.subscriptionId
          ),
          TE.chainW(TE.fromOption(() => productNotFoundError))
        ),
      }),
      TE.chain(({ signer_cf, product }) =>
        pipe(
          makeMessage(signatureRequest, product),
          submitMessageForUser(signer_cf)
        )
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
  ): TE.TaskEither<Error, CreatedMessage> =>
    pipe(
      getSignatureRequest(
        sendSignatureRequestBody.id,
        sendSignatureRequestBody.subscriptionId
      ),
      TE.chainW(
        flow(
          TE.fromOption(() => signatureRequestNotFoundError),
          TE.chain(prepareAndSendMessage(getFiscalCodeBySignerId, getProduct))
        )
      )
    );
