import { pgSchema } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');
export const core = pgSchema('core');
