import * as TO from "fp-ts/TaskOption";
import { FiscalCode } from "./fiscal-code";

export type User = {
  fiscalCode: FiscalCode;
};

export type GetUserByFiscalCode = (
  fiscalCode: FiscalCode
) => TO.TaskOption<User>;
