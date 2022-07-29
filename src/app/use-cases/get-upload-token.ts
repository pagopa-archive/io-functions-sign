import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { GetSignatureRequest } from "../../signature-request/signature-request";
import { GetDocumentUploadToken } from "../../signature-request/upload-token";

import { GetDocumentPayload, makeGetDocument } from "./get-document";

export const makeGetDocumentUploadToken =
  (
    getSignatureRequest: GetSignatureRequest,
    getDocumentUploadToken: GetDocumentUploadToken
  ) =>
  (payload: GetDocumentPayload) =>
    pipe(
      makeGetDocument(getSignatureRequest)(payload),
      TE.chain((document) => getDocumentUploadToken(document.id))
    );
