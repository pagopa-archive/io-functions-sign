import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { DocumentTitle, DocumentList } from "../document";

describe("DocumentTitle", () => {
  it.each([
    { title: "", expected: false },
    { title: "Document 1", expected: true },
  ])("should be valid (non empty) ($#)", ({ title, expected }) => {
    const result = DocumentTitle.decode(title);
    expect(pipe(result, E.isRight)).toBe(expected);
  });
});

describe("DocumentList", () => {
  it.each([
    { list: [], expected: false },
    {
      list: [
        {
          id: "my-document",
          title: "Document 1",
          clauses: [
            {
              title: "Clause 1",
              signatureFieldId: "sign1",
              required: false,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      expected: true,
    },
  ])("should always have at least one element ($#)", ({ list, expected }) => {
    expect(pipe(list, DocumentList.decode, E.isRight)).toBe(expected);
  });
});
