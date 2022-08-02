import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";

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
import { NewMessage } from "../../ui/api-models/NewMessage";
import { submitMessageForUser } from "../../infra/services/send-message";
import { CreatedMessage } from "../../ui/api-models/CreatedMessage";

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
      sequenceS(TE.ApplySeq)({
        product: pipe(
          getProduct(
            signatureRequest.productId,
            signatureRequest.subscriptionId
          ),
          TE.chainW(TE.fromOption(() => productNotFoundError))
        ),
      }),
      TE.map(({ product }) => mockMakeMessage(signatureRequest, product))
    );

export const sendMessage =
  (message: NewMessage, signerId: string) =>
  (
    getFiscalCodeBySignerId: GetFiscalCodeBySignerId
  ): TE.TaskEither<Error, CreatedMessage> =>
    pipe(
      sequenceS(TE.ApplySeq)({
        signer_cf: getFiscalCodeBySignerId(signerId),
      }),
      TE.chain(({ signer_cf }) =>
        pipe(message, submitMessageForUser(signer_cf))
      )
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
          TE.chain((sr) =>
            pipe(
              sr,
              prepareMessage(getProduct),
              TE.chain((message) =>
                pipe(getFiscalCodeBySignerId, sendMessage(message, sr.signerId))
              )
            )
          )
        )
      ),
      TE.map(() => void 0)
    );
