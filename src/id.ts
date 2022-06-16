import * as t from "io-ts";
import { ulid } from "ulid";

export const Id = t.string;

export type Id = t.TypeOf<typeof Id>;

export const id = () => ulid();
