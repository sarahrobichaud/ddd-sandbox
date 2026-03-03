import { schema } from '@cavok/data';
export * as DB_VALUE from '@cavok/data/values';

import { DBException, E_DB } from '#errors/db.errors';

export const tables = schema;
export * from 'drizzle-orm';

export type Schema = typeof schema;

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
  path: ['../../libs/config/env/.env.database'],
});

export type DBSchema = typeof schema;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);

export const db = drizzle<DBSchema>(client, { schema });
export type DatabaseClient = typeof db;
export type DBTransaction = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type Database = DatabaseClient | DBTransaction;

export type DBClients = {
  app: DatabaseClient;
};

export class DrizzleClient {
  private _db: typeof db | undefined;

  constructor() {
    this._db = db;
  }

  public get clients(): DBClients {
    if (!this._db) {
      throw new DBException(E_DB.CONNECTION_ERROR);
    }
    return {
      app: this._db,
    };
  }

  public get db(): DatabaseClient {
    if (!this._db) {
      throw new DBException(E_DB.CONNECTION_ERROR);
    }

    return this._db;
  }
}
