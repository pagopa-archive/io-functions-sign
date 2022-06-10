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
import {
  SignatureRequest,
  AddSignatureRequest,
  GetSignatureRequest,
} from "../../../signature-request/signature-request";

import { container } from "./database";

const containerId = "signature-requests";
const partitionKey = "subscriptionId";

const NewSignatureRequest = t.intersection([SignatureRequest, BaseModel]);

type NewSignatureRequest = t.TypeOf<typeof NewSignatureRequest>;

const RetrievedSignatureRequest = t.intersection([
  SignatureRequest,
  CosmosResource,
]);

type RetrievedSignatureRequest = t.TypeOf<typeof RetrievedSignatureRequest>;

class SignatureRequestModel extends CosmosdbModel<
  SignatureRequest,
  NewSignatureRequest,
  RetrievedSignatureRequest,
  typeof partitionKey
> {
  constructor(container: Container) {
    super(container, NewSignatureRequest, RetrievedSignatureRequest);
  }
}

const signatureRequestModel = pipe(
  container(containerId),
  E.map((c) => new SignatureRequestModel(c))
);

const signatureRequestModelTE = TE.fromEither(signatureRequestModel);

export const addSignatureRequest: AddSignatureRequest = (request) =>
  pipe(
    NewSignatureRequest.decode(request),
    E.mapLeft(() => new Error("Invalid Signature Request")),
    TE.fromEither,
    TE.chain((newRequest) =>
      pipe(
        signatureRequestModelTE,
        TE.chain((model) =>
          pipe(
            model.create(newRequest),
            TE.mapLeft(() => new Error("Error creating the Signature Request"))
          )
        )
      )
    )
  );

export const getSignatureRequest: GetSignatureRequest = (id, serviceId) =>
  pipe(
    NonEmptyString.decode(id),
    E.mapLeft(() => new Error("Invalid Signature Request Id")),
    TE.fromEither,
    TE.chain((id) =>
      pipe(
        signatureRequestModelTE,
        TE.chain((model) =>
          pipe(
            model.find([id, serviceId]),
            TE.mapLeft(() => new Error("Error getting the Signature Request"))
          )
        )
      )
    )
  );
