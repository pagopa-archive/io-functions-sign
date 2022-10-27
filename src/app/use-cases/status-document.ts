import * as E from "fp-ts/Either";
import * as t from "io-ts";

import { pipe } from "fp-ts/function";
import { ActionNotAllowedError } from "../../error";
import { Document } from "../../signature-request/document";

export const DocumentAction = t.keyof({
  START_VALIDATION: null,
  MARK_AS_READY: null,
  MARK_AS_INVALID: null,
});
export type DocumentAction = t.TypeOf<typeof DocumentAction>;

export const dispatchOnDocument =
  (action: DocumentAction) =>
  (document: Document): E.Either<ActionNotAllowedError, Document> => {
    switch (document.status) {
      case "WAIT_FOR_UPLOAD":
        return pipe(action, whenWaitForUploadOrReady(document));
      case "VALIDATION_IN_PROGRESS":
        return pipe(action, whenValidationInProgress(document));
      case "READY":
        return pipe(action, whenWaitForUploadOrReady(document));
      case "VALIDATION_ERROR":
        return pipe(action, whenValidationError(document));
      default:
        return E.left(new ActionNotAllowedError("Invalid status!"));
    }
  };

const whenWaitForUploadOrReady =
  (document: Document) =>
  (action: DocumentAction): E.Either<ActionNotAllowedError, Document> => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (action) {
      case "START_VALIDATION":
        return E.right({ ...document, status: "VALIDATION_IN_PROGRESS" });
      default:
        return E.left(
          new ActionNotAllowedError(
            "This operation is prohibited if the document is in WAIT_FOR_UPLOAD status!"
          )
        );
    }
  };

const whenValidationInProgress =
  (document: Document) =>
  (action: DocumentAction): E.Either<ActionNotAllowedError, Document> => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (action) {
      case "MARK_AS_READY":
        return E.right({ ...document, status: "READY" });
      case "MARK_AS_INVALID":
        return E.right({ ...document, status: "VALIDATION_ERROR" });
      default:
        return E.left(
          new ActionNotAllowedError(
            "This operation is prohibited if the document is in VALIDATION_IN_PROGRESS status!"
          )
        );
    }
  };

const whenValidationError =
  (document: Document) =>
  (action: DocumentAction): E.Either<ActionNotAllowedError, Document> => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (action) {
      case "START_VALIDATION":
        return E.right({ ...document, status: "VALIDATION_IN_PROGRESS" });
      default:
        return E.left(
          new ActionNotAllowedError(
            "This operation is prohibited if the document is in VALIDATION_ERROR status!"
          )
        );
    }
  };
