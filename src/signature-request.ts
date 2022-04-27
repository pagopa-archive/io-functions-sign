import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { findFirst } from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import { Signer } from "./signer";
import { Document } from "./document";

import { uuid } from "./uuid";

export type SignatureRequest = {
  id: string;
  signer: Signer;
  documents: Array<Document>;
};

export type GetSignatureRequestById = (
  id: SignatureRequest["id"]
) => TO.TaskOption<SignatureRequest>;

export type AddSignatureRequest = (
  request: SignatureRequest
) => TE.TaskEither<Error, SignatureRequest>;

export const createSignatureRequest = (
  signer: Signer,
  documents: Array<Document>
): SignatureRequest => ({
  id: uuid(),
  signer,
  documents,
});

export const getDocument =
  (documentId: Document["id"]) => (request: SignatureRequest) =>
    pipe(
      request.documents,
      findFirst((document) => document.id === documentId)
    );
