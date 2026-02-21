import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '#schema/index';

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
