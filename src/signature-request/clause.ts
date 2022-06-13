import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

export const ClauseTitle = NonEmptyString;

export const Clause = t.type({
  title: ClauseTitle,
  required: t.boolean,
});

export type Clause = t.TypeOf<typeof Clause>;

interface ClauseListBrand {
  readonly ClauseList: unique symbol;
}

export const ClauseList = t.brand(
  t.array(Clause),
  (clauses): clauses is t.Branded<Clause[], ClauseListBrand> =>
    clauses.length >= 1,
  "ClauseList"
);

export type ClauseList = t.TypeOf<typeof ClauseList>;
