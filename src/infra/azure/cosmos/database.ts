import { CosmosClient, Database } from "@azure/cosmos";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Reader";

import { config } from "../../../app/config";

export const database: E.Either<Error, Database> = pipe(
  config,
  E.map((config) => {
    const client = new CosmosClient(config.cosmos.connectionString);
    return client.database(config.cosmos.dbName);
  })
);

export const selectContainer = (name: string) =>
  pipe(
    R.ask<Database>(),
    R.map((database) => database.container(name))
  );

export const container = (containerId: string) =>
  pipe(database, E.map(selectContainer(containerId)));
