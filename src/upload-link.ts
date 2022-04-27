import { Document } from "./document";
import * as TE from "fp-ts/TaskEither";

export type UploadLink = {
  url: string;
  document: Document;
};

export interface UploadLinkInteractor {
  getForDocument: (document: Document) => TE.TaskEither<Error, UploadLink>;
}
