import { pipe } from "fp-ts/function";

import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import * as S from "fp-ts/string";

import { validate } from "@pagopa/handler-kit/lib/validation";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { SignatureRequest } from "../../signature-request/signature-request";

import { GetDocumentSnapshot } from "../../signature-request/snapshot";

export const makeGenerateDocumentSnapshots =
  (getDocumentSnapshot: GetDocumentSnapshot) => (request: SignatureRequest) =>
    pipe(
      request.documents,
      A.map((document) =>
        NonEmptyString.is(document.url)
          ? pipe(
              getDocumentSnapshot(document.id),
              TE.map((documentSnapshot) => ({
                ...document,
                url: S.Monoid.concat(
                  document.url as string,
                  "?snapshot=" + documentSnapshot.snapshot
                ),
              }))
            )
          : TE.left(
              new Error("Unable to generate a snapshot for each document!")
            )
      ),
      A.sequence(TE.ApplicativePar),
      TE.map((documents) => ({
        ...request,
        documents,
      })),
      TE.chainEitherKW(
        validate(SignatureRequest, "Unable to validate signature request")
      )
    );
