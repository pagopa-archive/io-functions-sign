import { flow } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { GetSignatureRequestById } from "../signature-request";

export const getSignatureRequest = (
  getSignatureRequestById: GetSignatureRequestById
) =>
  flow(
    getSignatureRequestById,
    TE.fromTaskOption(() => new Error("signature request not found"))
  );

export type GetSignatureRequest = ReturnType<typeof getSignatureRequest>;
