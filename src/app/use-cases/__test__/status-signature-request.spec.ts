import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import {
  dispatchOnSignatureRequest,
  SignatureRequestAction,
} from "../status-signature-request";
import { SignatureRequest } from "../../../signature-request/signature-request";
import { baseDocument } from "./status-document.spec";

const baseRequest = {
  id: "SR-ID1",
  subscriptionId: "SUB-ID",
  signerId: "Signer-SPNDNL80R13C555X",
  productId: "prod-id",
  status: "DRAFT",
  documents: [baseDocument],
};

describe("CheckStatusSignatureRequest", () => {
  it.each([
    { payload: { request: {}, status: "" }, expected: "INVALID" },
    {
      payload: {
        request: baseRequest,
        action: "MARK_AS_READY",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: baseRequest,
        action: "VALIDATE_DOCUMENT",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          documents: [
            {
              ...baseDocument,
              status: "WAIT_FOR_UPLOAD",
            },
          ],
        },
        action: "MARK_AS_READY",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          documents: [
            {
              ...baseDocument,
              status: "VALIDATION_IN_PROGRESS",
            },
          ],
        },
        action: "MARK_AS_READY",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          documents: [
            {
              ...baseDocument,
              status: "READY",
            },
          ],
        },
        action: "MARK_AS_READY",
      },
      expected: "READY",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "READY",
        },
        action: "VALIDATE_DOCUMENT",
      },
      expected: "WAIT_FOR_SIGNATURE",
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload.request as SignatureRequest,
      dispatchOnSignatureRequest(payload.action as SignatureRequestAction)
    );
    expect(
      pipe(
        makeRequest,
        E.map((req) => req.status),
        E.getOrElse(() => "INVALID")
      )
    ).toBe(expected);
  });
});
