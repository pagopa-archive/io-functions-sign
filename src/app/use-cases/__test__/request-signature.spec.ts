import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { addDays, subDays } from "date-fns/fp";
import { ValidationError } from "@pagopa/handler-kit/lib/validation";
import {
  makeRequestSignature,
  RequestSignaturePayload,
  RequestSignatureStatusPayload,
  updateStatusRequestSignature,
} from "../request-signature";

import { InvalidEntityError } from "../../../error";
import {
  mockAddSignatureRequest,
  mockGetProduct,
  mockGetSignatureRequest,
  mockGetSignerByFiscalCode,
  mockUpsertSignatureRequest,
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

describe("updateStatusRequestSignatureList", () => {
  it.each([
    { payload: {}, expected: false },
    {
      payload: {
        signatureRequestId: "sig-id",
        subscriptionId: "sub-id",
        signatureRequestStatus: "WAIT_FOR_ISSUER",
      },
      expected: false,
    },
    {
      payload: {
        signatureRequestId: "sig-id",
        subscriptionId: "sub-id",
        signatureRequestStatus: "READY",
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const updateRequest = pipe(
      payload as RequestSignatureStatusPayload,
      updateStatusRequestSignature(
        mockUpsertSignatureRequest,
        mockGetSignatureRequest
      )
    )();
    return updateRequest.then((data) => {
      pipe(
        data,
        E.mapLeft((e) => {
          expect(e).toBeInstanceOf(ValidationError);
        })
      );
      expect(pipe(data, E.isRight)).toBe(expected);
    });
  });
});
