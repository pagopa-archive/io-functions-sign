import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";

import {
  SignatureRequest,
  AddSignatureRequest,
  GetSignatureRequestById,
} from "../signature-request";

import {
  databaseTE,
  createItem,
  createContainerIfNotExists,
  getItem,
} from "./index";

const collectionId = "signature-request";
const partitionKey = "id";

export const addSignatureRequest: AddSignatureRequest = (
  request: SignatureRequest
) =>
  pipe(
    databaseTE,
    TE.chain(createContainerIfNotExists(collectionId, partitionKey)),
    TE.chain(createItem(request))
  );

export const getSignatureRequestById: GetSignatureRequestById = (
  id: SignatureRequest["id"]
) =>
  pipe(
    databaseTE,
    TE.chain(createContainerIfNotExists(collectionId, partitionKey)),
    TE.chain(getItem(id)),
    TO.fromTaskEither
  );
