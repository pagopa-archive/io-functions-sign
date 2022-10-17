import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Document } from "../../../signature-request/document";
import { dispatchOnDocument, DocumentAction } from "../status-document";

export const baseDocument = {
  id: "doc-id",
  title: "doc-title",
  status: "WAIT_FOR_UPLOAD",
  clauses: [
    {
      title: "doc-tos",
      required: false,
    },
  ],
};

describe("CheckStatusSignatureRequest", () => {
  it.each([
    { payload: { document: {}, status: "" }, expected: "INVALID" },
    {
      payload: {
        document: {
          ...baseDocument,
          status: "VALIDATION_IN_PROGRESS",
        },
        action: "START_VALIDATION",
      },
      expected: "INVALID",
    },
    {
      payload: {
        document: {
          ...baseDocument,
          status: "WAIT_FOR_UPLOAD",
        },
        action: "MARK_AS_READY",
      },
      expected: "INVALID",
    },
    {
      payload: {
        document: {
          ...baseDocument,
          status: "WAIT_FOR_UPLOAD",
        },
        action: "START_VALIDATION",
      },
      expected: "VALIDATION_IN_PROGRESS",
    },
    {
      payload: {
        document: {
          ...baseDocument,
          status: "VALIDATION_IN_PROGRESS",
        },
        action: "MARK_AS_READY",
      },
      expected: "READY",
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload.document as Document,
      dispatchOnDocument(payload.action as DocumentAction)
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
