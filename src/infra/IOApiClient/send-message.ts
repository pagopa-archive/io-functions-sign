import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

import { UrlFromString } from "@pagopa/ts-commons/lib/url";
import { pipe, flow } from "fp-ts/lib/function";

import { sequenceS } from "fp-ts/lib/Apply";
import { validate } from "@pagopa/handler-kit/lib/validation";
import { CreatedMessage } from "@pagopa/io-functions-services-sdk/CreatedMessage";
import { NewMessage } from "@pagopa/io-functions-services-sdk/NewMessage";

import { basePath, headers, timeoutFetch } from "./client";

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
              }),
            E.toError
          ),
          TE.chain((el) =>
            is2xx(el)
              ? TE.tryCatch(() => el.json(), E.toError)
              : TE.left(new Error("Unexpected webhook response"))
          )
        )
      ),
      TE.chainW(
        flow(validate(CreatedMessage, "Invalid response"), TE.fromEither)
      )
    );
