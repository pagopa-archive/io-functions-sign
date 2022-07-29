import { pipe } from "fp-ts/function";
import { isRight as isValid } from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { GetSignerByFiscalCode } from "../../../signer/signer";
import {
  makeRequestSignature,
  RequestSignaturePayload,
} from "../request-signature";
import { GetProduct, Product } from "../../../signature-request/product";
import {
  AddSignatureRequest,
  SignatureRequest,
} from "../../../signature-request/signature-request";
import { InvalidEntityError } from "../../../error/invalid-entity";

const mockGetSignerByFiscalCode: GetSignerByFiscalCode = (fiscalCode) =>
  pipe(
    fiscalCode,
    TE.fromNullable(new InvalidEntityError("Invalid CF")),
    TE.map((cf) => ({ id: `Signer-${cf}` }))
  );

const mockGetProduct: GetProduct = (id: string, subscriptionId: string) =>
  TE.right(
    O.fromNullable({
      id,
      subscriptionId,
      documents: [
        {
          title: "TITOLO DOC",
          clauses: [
            {
              title: "CLAUSOLA 1 DOC 1",
              required: true,
            },
          ],
        },
      ],
    } as Product)
  );

const mockAddSignatureRequest: AddSignatureRequest = (
  request: SignatureRequest
) => TE.right(request);

describe("MakeRequestSignatureList", () => {
  it.each([
    { payload: {} as RequestSignaturePayload, expected: false },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "prod-id",
      } as RequestSignaturePayload,
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload,
      makeRequestSignature(
        mockGetSignerByFiscalCode,
        mockGetProduct,
        mockAddSignatureRequest
      )
    )();
    return makeRequest.then((data) =>
      expect(pipe(data, isValid)).toBe(expected)
    );
  });
});
