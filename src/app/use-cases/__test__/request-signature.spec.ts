import { pipe } from "fp-ts/function";
import { isRight as isValid } from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { addDays, subDays } from "date-fns/fp";
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
          title: "doc-title",
          clauses: [
            {
              title: "doc-tos",
              required: false,
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
    { payload: {}, expected: false },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
      },
      expected: true,
    },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
        expiresAt: subDays(1, new Date()),
      },
      expected: false,
    },
    {
      payload: {
        productId: "prod-id",
        subscriptionId: "sub-id",
        fiscalCode: "SPNDNL80R13C555X",
        expiresAt: addDays(1, new Date()),
      },
      expected: true,
    },
  ])("should be valid ($#)", ({ payload, expected }) => {
    const makeRequest = pipe(
      payload as RequestSignaturePayload,
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
