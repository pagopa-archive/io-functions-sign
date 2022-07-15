import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { SignatureRequest } from "../../signature-request/signature-request";

export const sendSignatureRequest = (
  _signatureRequest: SignatureRequest
): TE.TaskEither<Error, SignatureRequest> =>
  pipe(TE.left(new Error("Not yet implemented")));
