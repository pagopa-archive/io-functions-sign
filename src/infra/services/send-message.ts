import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";
import { NewMessage } from "../../ui/api-models/NewMessage";
import { CreatedMessage } from "../../ui/api-models/CreatedMessage";
import { basePath, headers, timeoutFetch } from "./service";

const is2xx = (r: Response): boolean => r.status >= 200 && r.status < 300;

const getSubmitMessageForUserPath = (fiscalCode: string) =>
  pipe(`/api/v1/messages/${fiscalCode}`, UrlFromString.decode);

export const submitMessageForUser =
  (fiscalCode: FiscalCode) => (body: NewMessage) =>
    pipe(
      sequenceS(E.Apply)({
        basePath,
        headers,
        timeoutFetch,
        path: pipe(
          fiscalCode,
          getSubmitMessageForUserPath,
          E.mapLeft(() => new Error("Invalid path"))
        ),
      }),
      TE.fromEither,
      TE.chain(({ basePath, headers, timeoutFetch, path }) =>
        pipe(
          TE.tryCatch(
            () =>
              timeoutFetch(`${basePath.href}${path.href}`, {
                body: JSON.stringify(body),
                method: "POST",
                headers,
              })
                .then((r) => {
                  if (!is2xx(r)) {
                    throw Error("Unexpected webhook response");
                  }
                  return r;
                })
                .then((r) => r.json()),
            E.toError
          )
        )
      ),
      TE.chain(
        flow(
          CreatedMessage.decode,
          E.mapLeft(() => new Error("Invalid response")),
          TE.fromEither
        )
      )
    );
