import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ClauseTitle, ClauseList } from "../clause";

describe("ClauseTitle", () => {
  it.each([
    { title: "", expected: false },
    { title: "Clause 1", expected: true },
  ])("should be valid (non empty) ($#)", ({ title, expected }) => {
    const result = ClauseTitle.decode(title);
    expect(pipe(result, E.isRight)).toBe(expected);
  });
});

describe("ClauseList", () => {
  it.each([
    { list: [], expected: false },
    {
      list: [
        {
          title: "Clause 1",
          signatureFieldId: "sign1",
          required: false,
        },
      ],
      expected: true,
    },
  ])("should always have at least one element ($#)", ({ list, expected }) => {
    expect(pipe(list, ClauseList.decode, E.isRight)).toBe(expected);
  });
});
