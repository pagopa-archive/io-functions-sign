import { flow, pipe, constant } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { InvalidEntityError } from "../../../error";
import { SendSignatureRequestBody } from "../../../infra/azure/functions/send-signature-request-message";
import { signatureRequestNotFoundError } from "../../../signature-request/signature-request";
import { mockGetProduct, mockGetSignatureRequest } from "./mock";

import { prepareMessage } from "./../send-signature-request";

describe("MakeRequestSignatureList", () => {
  it.each([
    { payload: {}, expected: false },
    {
      payload: {
        signatureRequestId: "sr-id",
        subscriptionId: "sub-id",
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload,
      validate(SendSignatureRequestBody, "Invalid payload"),
      E.mapLeft(constant(new InvalidEntityError("Invalid payload"))),
      E.map((pl) =>
        pipe(
          mockGetSignatureRequest(pl.signatureRequestId, pl.subscriptionId),
          TE.chainW(
            flow(
              TE.fromOption(() => signatureRequestNotFoundError),
              TE.chain((sr) => pipe(sr, prepareMessage(mockGetProduct)))
            )
          )
        )
      ),
      TE.fromEither,
      TE.flatten
    )();
    return makeRequest.then((data) => {
      pipe(
        data,
        E.mapLeft((e) => {
          expect(e).toBeInstanceOf(InvalidEntityError);
        })
      );
      expect(pipe(data, E.isRight)).toBe(expected);
    });
  });
});
