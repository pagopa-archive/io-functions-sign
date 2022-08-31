import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { constant, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";
import { isAfter } from "date-fns";
import { Subscription } from "../../signature-request/subscription";
import { GetSignerByFiscalCode } from "../../signer/signer";
import {
  SignatureRequest,
  AddSignatureRequest,
  mockQrCodeUrl,
} from "../../signature-request/signature-request";
import { id } from "../../id";
import {
  Product,
  GetProduct,
  getDocumentsByMetadata,
  productNotFoundError,
} from "../../signature-request/product";
import { timestamps } from "../../timestamps";
import { InvalidEntityError } from "../../error";

export type RequestSignaturePayload = {
  expiresAt?: UTCISODateFromString;
  subscriptionId: Subscription["id"];
  fiscalCode: FiscalCode;
  productId: Product["id"];
};

export const makeRequestSignature =
  (
    getSignerByFiscalCode: GetSignerByFiscalCode,
    getProduct: GetProduct,
    addSignatureRequest: AddSignatureRequest
  ) =>
  (payload: RequestSignaturePayload): TE.TaskEither<Error, SignatureRequest> =>
    pipe(
      sequenceS(TE.ApplySeq)({
        signer: getSignerByFiscalCode(payload.fiscalCode),
        documents: pipe(
          getProduct(payload.productId, payload.subscriptionId),
          TE.chainW(TE.fromOption(() => productNotFoundError)),
          TE.chainEitherK(getDocumentsByMetadata)
        ),
        expiresAt: pipe(
          TE.of(payload.expiresAt),
          TE.filterOrElse(
            (_) => _ === undefined || isAfter(_, Date.now()),
            constant(
              new InvalidEntityError(
                "The expiration date must be in the future"
              )
            )
          )
        ),
      }),
      TE.map(
        ({ signer, documents, expiresAt }): SignatureRequest => ({
          id: id(),
          expiresAt,
          subscriptionId: payload.subscriptionId,
          productId: payload.productId,
          signerId: signer.id,
          documents,
          // WARNING! this is just a placeholder
          // TODO: replace the static QR-code with a dynamic one
          qrCodeUrl: mockQrCodeUrl,
          ...timestamps(),
        })
      ),
      TE.chainFirst(addSignatureRequest)
    );
