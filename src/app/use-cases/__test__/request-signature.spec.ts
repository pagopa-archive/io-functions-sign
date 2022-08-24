import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { addDays, subDays } from "date-fns/fp";
import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../request-signature";

import { InvalidEntityError } from "../../../error";
import {
  mockAddSignatureRequest,
  mockGetProduct,
  mockGetSignerByFiscalCode,
} from "./mock";

describe("MakeRequestSignatureList", () => {
  it.each([
    { payload: {}, expected: false },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
      },
      expected: true,
    },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
        expiresAt: subDays(1, new Date()),
      },
      expected: false,
    },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
        expiresAt: addDays(1, new Date()),
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload as RequestSignaturePayload,
      makeRequestSignature(
        mockGetSignerByFiscalCode,
        mockGetProduct,
        mockAddSignatureRequest
      )
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
