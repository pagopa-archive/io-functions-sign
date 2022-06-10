import * as crypto from "node:crypto";
import * as t from "io-ts";

export const Id = t.string;

export type Id = t.TypeOf<typeof Id>;

export const id = () => crypto.randomUUID();
