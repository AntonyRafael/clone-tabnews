import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controllers";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(req, res) {
  let dbClient;
  dbClient = await database.getNewClient();

  const pendingMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dbClient,
  });
  await dbClient.end();
  return res.status(200).json(pendingMigrations);
}

async function postHandler(req, res) {
  let dbClient;
  dbClient = await database.getNewClient();

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dbClient,
    dryRun: false,
  });

  await dbClient.end();
  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations);
  }

  return res.status(200).json(migratedMigrations);
}
