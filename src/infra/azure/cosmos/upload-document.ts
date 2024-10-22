import { pipe } from "fp-ts/function";

import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

import {
  BaseModel,
  CosmosdbModel,
  CosmosResource,
} from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";

import * as t from "io-ts";
import { Container } from "@azure/cosmos";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { validate } from "@pagopa/handler-kit/lib/validation";
import {
  AddUploadDocument,
  GetUploadDocument,
  UploadDocument,
  uploadDocumentNotFoundError,
  UpsertUploadDocument,
} from "../../../signature-request/upload-document";

import { container } from "./database";

const containerId = "upload-documents";

const NewUploadDocument = t.intersection([UploadDocument, BaseModel]);

type NewUploadDocument = t.TypeOf<typeof NewUploadDocument>;

const RetrievedUploadDocument = t.intersection([
  UploadDocument,
  CosmosResource,
]);

type RetrievedUploadDocumnet = t.TypeOf<typeof RetrievedUploadDocument>;

class UploadDocumentModel extends CosmosdbModel<
  UploadDocument,
  NewUploadDocument,
  RetrievedUploadDocumnet
> {
  constructor(container: Container) {
    super(container, NewUploadDocument, RetrievedUploadDocument);
  }
}

const uploadDocumentModel = pipe(
  container(containerId),
  E.map((c) => new UploadDocumentModel(c))
);

const uploadDocumentModelTE = TE.fromEither(uploadDocumentModel);

export const addUploadDocument: AddUploadDocument = (request) =>
  pipe(
    request,
    validate(NewUploadDocument, "Upload Document not found"),
    TE.fromEither,
    TE.chain((newDocument) =>
      pipe(
        uploadDocumentModelTE,
        TE.chain((model) =>
          pipe(
            model.create(newDocument),
            TE.mapLeft(
              (): Error => new Error("Error creating the Upload Document")
            )
          )
        )
      )
    )
  );

export const getUploadDocument: GetUploadDocument = (id) =>
  pipe(
    id,
    validate(NonEmptyString, "Invalid Upload Document Id"),
    TE.fromEither,
    TE.chain((id) =>
      pipe(
        uploadDocumentModelTE,
        TE.chain((model) =>
          pipe(
            model.find([id]),
            TE.mapLeft((): Error => uploadDocumentNotFoundError)
          )
        )
      )
    )
  );

export const upsertUploadDocument: UpsertUploadDocument = (request) =>
  pipe(
    request,
    validate(NewUploadDocument, "Upload document is not valid"),
    TE.fromEither,
    TE.chain((newDocument) =>
      pipe(
        uploadDocumentModelTE,
        TE.chain((model) =>
          pipe(
            model.upsert(newDocument),
            TE.mapLeft(
              (): Error => new Error("Error upserting the Upload Document")
            )
          )
        )
      )
    )
  );
