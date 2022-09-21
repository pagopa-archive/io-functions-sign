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
    { payload: { request: {}, status: "" }, expected: "INVALID" },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "UPLOAD_DOCUMENT",
      },
      expected: "DRAFT",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "MARK_AS_READY",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
        },
        action: "VALIDATE_DOCUMENT",
      },
      expected: "INVALID",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "DRAFT",
          documents: [
            {
              ...baseRequest.documents[0],
              url: "https://example.com",
            },
          ],
        },
        action: "UPLOAD_DOCUMENT",
      },
      expected: "WAIT_FOR_ISSUER",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "WAIT_FOR_ISSUER",
        },
        action: "UPLOAD_DOCUMENT",
      },
      expected: "WAIT_FOR_ISSUER",
    },
    {
      payload: {
        request: {
          ...baseRequest,
          status: "WAIT_FOR_ISSUER",
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
      dispatch(payload.action as SignatureRequestAction)
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
