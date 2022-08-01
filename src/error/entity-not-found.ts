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
