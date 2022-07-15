import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import {
  SignatureRequest,
  SignatureRequestList,
} from "../../signature-request/signature-request";

export const sendSignatureRequest = (
  _signatureRequest: SignatureRequestList
): TE.TaskEither<Error, SignatureRequest> =>
  pipe(TE.left(new Error("Not yet implemented" + _signatureRequest[0].id)));
