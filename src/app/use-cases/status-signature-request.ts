import * as E from "fp-ts/Either";
import * as t from "io-ts";

import { pipe } from "fp-ts/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { ProblemDetail } from "@pagopa/handler-kit/lib/problem-detail";
import { SignatureRequest } from "../../signature-request/signature-request";

export class ActionNotAllowedError extends Error implements ProblemDetail {
  type = "/problems/action-not-allowed";
  title = "Action not allowed";
  status = "400";
  constructor(public detail: string) {
    super(detail);
    this.name = "ActionNotAllowedError";
  }
}

export const SignatureRequestAction = t.keyof({
  UPLOAD_DOCUMENT: null,
  MARK_AS_READY: null,
  VALIDATE_DOCUMENT: null,
  MARK_AS_SIGNED: null,
});
export type SignatureRequestAction = t.TypeOf<typeof SignatureRequestAction>;

export const nextStatus =
  (request: SignatureRequest) =>
  (
    action: SignatureRequestAction
  ): E.Either<ActionNotAllowedError, SignatureRequest> => {
    switch (request.status) {
      case "DRAFT":
        return pipe(action, whenDraft(request));
      case "WAIT_FOR_ISSUER":
        return pipe(action, whenWaitForIssuer(request));
      case "READY":
        return pipe(action, whenReady(request));
      case "WAIT_FOR_SIGNATURE":
        return pipe(action, whenWaitForSignature(request));
      case "SIGNED":
        return E.left(
          new ActionNotAllowedError(
            "This action is not allowed when signature request is already SIGNED!"
          )
        );
      default:
        return E.left(new ActionNotAllowedError("Status not valid!"));
    }
  };

const whenDraft =
  (request: SignatureRequest) =>
  (
    action: SignatureRequestAction
  ): E.Either<ActionNotAllowedError, SignatureRequest> =>
    action === "UPLOAD_DOCUMENT"
      ? pipe(
          request.documents.every((document) => NonEmptyString.is(document.url))
            ? E.right({ ...request, status: "WAIT_FOR_ISSUER" })
            : E.right({ ...request, status: "DRAFT" })
        )
      : E.left(
          new ActionNotAllowedError(
            "This action is not allowed when signature request is in DRAFT status!"
          )
        );

const whenWaitForIssuer =
  (request: SignatureRequest) =>
  (
    action: SignatureRequestAction
  ): E.Either<ActionNotAllowedError, SignatureRequest> => {
    switch (action) {
      case "MARK_AS_READY":
        return E.right({ ...request, status: "READY" });
      case "UPLOAD_DOCUMENT":
        return E.right({ ...request, status: "WAIT_FOR_ISSUER" });
      default:
        return E.left(
          new ActionNotAllowedError(
            "This action is not allowed when signature request is in WAIT_FOR_ISSUER status!"
          )
        );
    }
  };

const whenReady =
  (request: SignatureRequest) =>
  (
    action: SignatureRequestAction
  ): E.Either<ActionNotAllowedError, SignatureRequest> => {
    switch (action) {
      case "VALIDATE_DOCUMENT":
        return pipe(E.right({ ...request, status: "WAIT_FOR_SIGNATURE" }));
      case "MARK_AS_READY":
        return E.left(
          new ActionNotAllowedError(
            "Signature Request is already in READY status!"
          )
        );
      default:
        return E.left(
          new ActionNotAllowedError(
            "This action is not allowed when signature request is in WAIT_FOR_ISSUER status!"
          )
        );
    }
  };

const whenWaitForSignature =
  (request: SignatureRequest) =>
  (
    action: SignatureRequestAction
  ): E.Either<ActionNotAllowedError, SignatureRequest> =>
    action === "MARK_AS_SIGNED"
      ? pipe(E.right({ ...request, status: "SIGNED" }))
      : E.left(
          new ActionNotAllowedError(
            "This action is not allowed when signature request is in WAIT_FOR_SIGNATURE status!"
          )
        );
