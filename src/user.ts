import { FiscalCode } from "./fiscal-code";

import * as TO from "fp-ts/TaskOption";

export type User = {
  fiscalCode: FiscalCode;
};

export type GetUserByFiscalCode = (
  fiscalCode: FiscalCode
) => TO.TaskOption<User>;
