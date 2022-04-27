import { flow } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { SignatureRequestRepository } from "../signature-request";

export const getSignatureRequest = (
  signatureRequests: SignatureRequestRepository
) =>
  flow(
    (id: string) => signatureRequests.getById(id),
    TE.fromTaskOption(() => new Error("signature request not found"))
  );

export type GetSignatureRequest = ReturnType<typeof getSignatureRequest>;
