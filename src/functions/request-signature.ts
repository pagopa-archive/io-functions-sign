import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";

import * as E from "fp-ts/Either";
import * as T from "fp-ts/Task";

import { pipe } from "fp-ts/function";

import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../use-cases/request-signature";

import { GetSignerByFiscalCode, AddSigner } from "../signer";
import { GetUserByFiscalCode } from "../user";
import { addSignatureRequest } from "../cosmos/signature-request";

const staticGetSignerByFiscalCode: GetSignerByFiscalCode = (_) =>
  TO.of({ id: "luca-signer" });

const staticAddSigner: AddSigner = (_) => TE.left(new Error("not implemented"));

const staticGetUserByFiscalCode: GetUserByFiscalCode = (_) => TO.none;

const requestSignature = makeRequestSignature(
  staticGetSignerByFiscalCode,
  staticGetUserByFiscalCode,
  staticAddSigner,
  addSignatureRequest
);

export default async () =>
  pipe(
    RequestSignaturePayload.decode({
      fiscalCode: "TAMMRA80A41H501I",
      documents: [],
    }),

    E.mapLeft(() => new Error("bad request")),

    TE.fromEither,
    TE.chain(requestSignature),

    TE.fold(
      (e) =>
        T.of({
          body: JSON.stringify({
            error: e.message,
          }),
          status: 422,
        }),
      (response) =>
        T.of({
          body: JSON.stringify({ response }),
          status: 201,
        })
    )
  )();
