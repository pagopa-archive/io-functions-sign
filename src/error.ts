/* eslint-disable max-classes-per-file */
// TODO: move to PagoPA TypeScript commons?
import { ProblemDetail } from "@pagopa/handler-kit/lib/problem-detail";

export class EntityNotFoundError extends Error implements ProblemDetail {
  type = "/problems/entity-not-found";
  title = "Entity not found";
  status = "404";
  constructor(public detail: string) {
    super(detail);
    this.name = "EntityNotFoundError";
  }
}
export class InvalidDateError extends Error implements ProblemDetail {
  type = "/problems/invalid-date";
  title = "Date not valid";
  status = "400";
  constructor(public detail: string) {
    super(detail);
    this.name = "InvalidDateError";
  }
}
