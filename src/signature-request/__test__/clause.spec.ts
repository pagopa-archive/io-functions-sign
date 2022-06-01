import { isRight as isValid } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ClauseTitle, ClauseList } from "../clause";

describe("ClauseTitle", () => {
  it.each([
    { title: "", expected: false },
    { title: "Clause 1", expected: true },
  ])("should be valid (non empty) ($#)", ({ title, expected }) => {
    const result = ClauseTitle.decode(title);
    expect(pipe(result, isValid)).toBe(expected);
  });
});

describe("ClauseList", () => {
  it.each([
    { list: [], expected: false },
    {
      list: [
        {
          title: "Clause 1",
          required: false,
        },
      ],
      expected: true,
    },
  ])("should always have at least one element ($#)", ({ list, expected }) => {
    expect(pipe(list, ClauseList.decode, isValid)).toBe(expected);
  });
});
