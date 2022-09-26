import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { constant, pipe } from "fp-ts/lib/function";

import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { sequenceS } from "fp-ts/lib/Apply";
import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";
import { isAfter } from "date-fns";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { Subscription } from "../../signature-request/subscription";
import { GetSignerByFiscalCode } from "../../signer/signer";
import {
  SignatureRequest,
  AddSignatureRequest,
  mockQrCodeUrl,
  UpsertSignatureRequest,
  GetSignatureRequest,
} from "../../signature-request/signature-request";
import { id } from "../../id";
import {
  Product,
  GetProduct,
  getDocumentsByMetadata,
  productNotFoundError,
} from "../../signature-request/product";
import { timestamps } from "../../timestamps";
import { EntityNotFoundError, InvalidEntityError } from "../../error";
import { dispatch } from "./status-signature-request";

export type RequestSignaturePayload = {
  expiresAt?: UTCISODateFromString;
  subscriptionId: Subscription["id"];
  fiscalCode: FiscalCode;
  productId: Product["id"];
};

export type RequestSignatureStatusPayload = {
  subscriptionId: Subscription["id"];
  signatureRequestId: SignatureRequest["id"];
  signatureRequestStatus: SignatureRequest["status"];
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
            (expirationDate) =>
              expirationDate === undefined ||
              isAfter(expirationDate, Date.now()),
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
          status: "DRAFT",
          // WARNING! this is just a placeholder
          // TODO: replace the static QR-code with a dynamic one
          qrCodeUrl: mockQrCodeUrl,
          ...timestamps(),
        })
      ),
      TE.chainFirst(addSignatureRequest)
    );

/*
 * Update status of signature request only if new status is READY
 */
export const updateStatusRequestSignature =
  (
    upsertSignatureRequest: UpsertSignatureRequest,
    getSignatureRequest: GetSignatureRequest
  ) =>
  (
    payload: RequestSignatureStatusPayload
  ): TE.TaskEither<Error, SignatureRequest> =>
    pipe(
      payload.signatureRequestStatus,
      validate(t.literal("READY"), "Only READY status is allowed!"),
      TE.fromEither,
      TE.chain(() =>
        getSignatureRequest(payload.signatureRequestId, payload.subscriptionId)
      ),
      TE.chainW(
        TE.fromOption(
          () => new EntityNotFoundError("Error getting the Signature Request")
        )
      ),
      TE.chainEitherKW(dispatch("MARK_AS_READY")),
      TE.chain(upsertSignatureRequest)
    );
