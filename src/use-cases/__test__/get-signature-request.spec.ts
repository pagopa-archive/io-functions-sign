import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

import { GetSignatureRequestById } from "../../signature-request";

import {
  GetSignatureRequest,
  getSignatureRequest as makeGetSignatureRequest,
} from "../get-signature-request";

const getSignatureRequestById: GetSignatureRequestById = (_) => TO.none;

describe("getSignatureRequest", function () {
  let getSignatureRequest: GetSignatureRequest;

  beforeAll(function () {
    getSignatureRequest = makeGetSignatureRequest(getSignatureRequestById);
  });

  it("should return error on not found", async function () {
    const result = await getSignatureRequest(
      "0cbcf6c6-ca16-4731-88d1-b35b2f9662eb"
    )();
    expect(E.isLeft(result)).toBe(true);
  });
});
