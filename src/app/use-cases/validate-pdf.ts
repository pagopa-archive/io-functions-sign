import { PDFDocument } from "pdf-lib";

import * as TE from "fp-ts/TaskEither";

import { pipe } from "fp-ts/function";

export const getPdfMetadata = (buffer: Buffer) =>
  pipe(
    TE.tryCatch(
      () =>
        PDFDocument.load(buffer, {
          updateMetadata: false,
        }),
      () => new Error("This is not a valid PDF")
    )
  );
