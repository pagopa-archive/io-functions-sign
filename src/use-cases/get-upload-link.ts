import { pipe } from "fp-ts/lib/function";
import { Document } from "../document";
import { SignatureRequest, getDocument } from "../signature-request";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

import { GetSignatureRequest } from "./get-signature-request";
import { GetUploadLinkForDocument } from "../upload-link";

export const getUploadLink =
  (
    getSignatureRequest: GetSignatureRequest,
    getUploadLinkForDocument: GetUploadLinkForDocument
  ) =>
  (signatureRequestId: SignatureRequest["id"], documentId: Document["id"]) =>
    pipe(
      getSignatureRequest(signatureRequestId),
      TE.map(getDocument(documentId)),
      TE.chain(
        O.fold(
          () => TE.left(new Error("document not found")),
          (document) => TE.right(document)
        )
      ),
      TE.map(getUploadLinkForDocument)
    );
