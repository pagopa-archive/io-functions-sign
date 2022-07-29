// TODO: move to PagoPA TypeScript commons?
import { ProblemDetail } from "@pagopa/handler-kit/lib/problem-detail";

export class InvalidEntityError extends Error implements ProblemDetail {
  type = "/problems/invalid-entity";
  title = "Entity not valid";
  status = "400";
  constructor(public detail: string) {
    super(detail);
    this.name = "InvalidEntityError";
  }
}
