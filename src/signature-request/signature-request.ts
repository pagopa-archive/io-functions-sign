import * as t from "io-ts";
import { Encoder } from "io-ts/Encoder";

import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/lib/Option";
import { UTCISODateFromString } from "@pagopa/ts-commons/lib/dates";
import { SignerId } from "../signer/signer";
import { Timestamps } from "../timestamps";
import { EntityNotFoundError } from "../error";
import { DocumentList } from "./document";
import { SubscriptionId } from "./subscription";
import { ProductId } from "./product";

export const SignatureRequestId = t.string;

export const SignatureRequestStatus = t.keyof({
  DRAFT: null,
  WAIT_FOR_SIGNATURE: null,
});

export type SignatureRequestStatus = t.TypeOf<typeof SignatureRequestStatus>;

export const SignatureRequest = t.intersection([
  t.type({
    id: SignatureRequestId,
    signerId: SignerId,
    subscriptionId: SubscriptionId,
    productId: ProductId,
    documents: DocumentList,
  }),
  t.partial({
    expiresAt: UTCISODateFromString,
  }),
  Timestamps,
]);

export const status = (request: SignatureRequest): SignatureRequestStatus =>
  request.documents.every((document) => document.url && document.url.length > 0)
    ? "WAIT_FOR_SIGNATURE"
    : "DRAFT";

export type SignatureRequest = t.TypeOf<typeof SignatureRequest>;

export type GetSignatureRequest = (
  id: SignatureRequest["id"],
  subscriptionId: SignatureRequest["subscriptionId"]
) => TaskEither<Error, Option<SignatureRequest>>;

export type UpsertSignatureRequest = (
  request: SignatureRequest
) => TaskEither<Error, SignatureRequest>;

export type AddSignatureRequest = (
  request: SignatureRequest
) => TaskEither<Error, SignatureRequest>;

export const signatureRequestNotFoundError = new EntityNotFoundError(
  "Signature request not found"
);

export type EnqueueSignatureRequest = (
  request: SignatureRequest
) => TaskEither<Error, SignatureRequest>;

export const SignatureRequestMessage: Encoder<string, SignatureRequest> = {
  encode: (request) =>
    pipe(
      {
        signatureRequestId: request.id,
        subscriptionId: request.subscriptionId,
      },
      JSON.stringify
    ),
};
