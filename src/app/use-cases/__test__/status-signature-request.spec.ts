import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { dispatch, SignatureRequestAction } from "../status-signature-request";
import { SignatureRequest } from "../../../signature-request/signature-request";

const baseRequest = {
  id: "SR-ID1",
  subscriptionId: "SUB-ID",
  signerId: "Signer-SPNDNL80R13C555X",
  productId: "prod-id",
  status: "DRAFT",
  documents: [
    {
      id: "doc-id",
      title: "doc-title",
      clauses: [
        {
          title: "doc-tos",
          required: false,
        },
      ],
    },
  ],
};

describe("CheckStatusSignatureRequest", () => {
  it.each([
    { payload: { request: {}, status: "" }, expected: false },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "UPLOAD_DOCUMENT",
      },
      expected: true,
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "MARK_AS_READY",
      },
      expected: false,
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "VALIDATE_DOCUMENT",
      },
      expected: false,
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "WAIT_FOR_ISSUER",
        },
        action: "UPLOAD_DOCUMENT",
      },
      expected: true,
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "WAIT_FOR_ISSUER",
        },
        action: "MARK_AS_READY",
      },
      expected: true,
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "READY",
        },
        action: "VALIDATE_DOCUMENT",
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload.request as SignatureRequest,
      dispatch(payload.action as SignatureRequestAction)
    );
    expect(pipe(makeRequest, E.isRight)).toBe(expected);
  });
});
