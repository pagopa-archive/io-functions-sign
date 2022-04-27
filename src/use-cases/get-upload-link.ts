import { pipe } from "fp-ts/lib/function";
import { Document } from "../document";
import { SignatureRequest, getDocument } from "../signature-request";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

import { getSignatureRequest as makeGetSignatureRequest } from "./get-signature-request";
import { UploadLinkInteractor } from "../upload-link";

export const getUploadLink =
  (
    getSignatureRequest: ReturnType<typeof makeGetSignatureRequest>,
    uploadLinks: UploadLinkInteractor
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
      TE.chain(uploadLinks.getForDocument)
    );
