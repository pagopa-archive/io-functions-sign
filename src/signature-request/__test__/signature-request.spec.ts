import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { mockQrCodeUrl, SignatureRequest } from "../signature-request";

describe("SignatureRequestList", () => {
  it.each([
    { signatureRequest: {}, expected: false },
    {
      signatureRequest: {
        id: "sr-id",
        subscriptionId: "sub-id",
        productId: "prod-id",
        signerId: "sign-id",
        status: "DRAFT",
        qrCodeUrl: mockQrCodeUrl,
        documents: [
          {
            id: "my-document",
            title: "Document 1",
            clauses: [
              {
                title: "Clause 1",
                required: false,
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ signatureRequest, expected }) => {
    expect(pipe(signatureRequest, SignatureRequest.decode, E.isRight)).toBe(
      expected
    );
  });
});
