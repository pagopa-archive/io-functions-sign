import { Document } from "./document";

export type UploadLink = {
  url: string;
  document: Document;
};

export type GetUploadLinkForDocument = (document: Document) => UploadLink;
