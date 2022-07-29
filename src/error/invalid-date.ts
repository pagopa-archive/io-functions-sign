// TODO: move to PagoPA TypeScript commons?
import { ProblemDetail } from "@pagopa/handler-kit/lib/problem-detail";

export class InvalidDateError extends Error implements ProblemDetail {
  type = "/problems/invalid-date";
  title = "Date not valid";
  status = "400";
  constructor(public detail: string) {
    super(detail);
    this.name = "InvalidDateError";
  }
}
