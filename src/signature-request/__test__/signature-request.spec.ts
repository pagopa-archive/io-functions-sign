import { isRight as isValid } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { SignatureRequestList } from "../signature-request";

describe("SignatureRequestList", () => {
  it.each([
    { list: [], expected: false },
    {
      list: [
        {
          id: "sr-id",
          subscriptionId: "sub-id",
          productId: "prod-id",
          signerId: "sign-id",
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
      ],
      expected: true,
    },
  ])("should always have at least one element ($#)", ({ list, expected }) => {
    expect(pipe(list, SignatureRequestList.decode, isValid)).toBe(expected);
  });
});
