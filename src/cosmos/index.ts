import { CosmosClient, Database, Container, ItemResponse } from "@azure/cosmos";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import * as RTE from "fp-ts/ReaderTaskEither";

import * as TE from "fp-ts/TaskEither";
import { config } from "../config";

export const database: E.Either<Error, Database> = pipe(
  config,
  E.map((config) => {
    const client = new CosmosClient(config.cosmos.connectionString);
    return client.database("io-sign");
  })
);

export const databaseTE = TE.fromEither(database);

export const createContainerIfNotExists = (
  id: string,
  partitionKey: string
): RTE.ReaderTaskEither<Database, Error, Container> =>
  pipe(
    RTE.ask<Database>(),
    RTE.chainTaskEitherK((db) =>
      TE.tryCatch(
        () =>
          db.containers.createIfNotExists({
            id,
            partitionKey: `/${partitionKey}`,
          }),
        (reason) => new Error(`${reason}`)
      )
    ),
    RTE.map((response) => response.container)
  );

const unwrap = <T>(response: ItemResponse<T>) =>
  pipe(response.resource, E.fromNullable(new Error("unable to load resource")));

export const createItem = <I>(item: I) =>
  pipe(
    RTE.ask<Container>(),
    RTE.chainTaskEitherK((container) =>
      TE.tryCatch(
        () =>
          container.items.create(item, {
            disableAutomaticIdGeneration: true,
          }),
        () => new Error("unable to create the item")
      )
    ),
    RTE.chainEitherK(unwrap)
  );

export const getItem = (id: string) =>
  pipe(
    RTE.ask<Container>(),
    RTE.chainTaskEitherK((container) =>
      TE.tryCatch(
        () => container.item(id).read(),
        (_) => new Error("unable to read item")
      )
    ),
    RTE.chainEitherK(unwrap)
  );
