import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { GetSignerByFiscalCode } from "../../../signer/signer";
import { GetProduct, Product } from "../../../signature-request/product";
import {
  AddSignatureRequest,
  GetSignatureRequest,
  SignatureRequest,
} from "../../../signature-request/signature-request";
import { InvalidEntityError } from "../../../error/invalid-entity";

export const mockGetSignerByFiscalCode: GetSignerByFiscalCode = (fiscalCode) =>
  pipe(
    fiscalCode,
    TE.fromNullable(new InvalidEntityError("Invalid CF")),
    TE.map((cf) => ({ id: `Signer-${cf}` }))
  );

export const mockGetProduct: GetProduct = (
  id: string,
  subscriptionId: string
) =>
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

export const mockGetSignatureRequest: GetSignatureRequest = (
  id: string,
  subscriptionId: string
) =>
  TE.right(
    O.fromNullable({
      id,
      subscriptionId,
      signerId: "Signer-SPNDNL80R13C555X",
      productId: "prod-id",
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
    } as SignatureRequest)
  );

export const mockAddSignatureRequest: AddSignatureRequest = (
  request: SignatureRequest
) => TE.right(request);