import { v4 as uuidv4, validate } from "uuid";

import { string as stringD, refine } from "io-ts/Decoder";
import { pipe } from "fp-ts/function";

export type UUID = string & { readonly UUID: unique symbol };
export const uuid = (): UUID => uuidv4() as UUID;
export const isUUID = (s: string): s is UUID => validate(s);
export const UUID = pipe(stringD, refine(isUUID, "UUID"));
