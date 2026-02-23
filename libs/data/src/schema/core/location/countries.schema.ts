import { sql } from 'drizzle-orm';
import { boolean, check, pgTable } from 'drizzle-orm/pg-core';

import { serial, text } from 'drizzle-orm/pg-core';

export const countries = pgTable(
  'countries',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    code: text('code').notNull().unique(), // ISO 3166-1 alpha-2
    codeAlpha3: text('code_alpha3').notNull().unique(), // ISO 3166-1 alpha-3
    phoneCode: text('phone_code').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    check('CK_country_code_length', sql`length(${table.code}) = 2`),
    check('CK_country_code_alpha3_length', sql`length(${table.codeAlpha3}) = 3`),
    check('CK_country_phone_code_length', sql`length(${table.phoneCode}) <= 10`),
    check('CK_country_name_length', sql`length(${table.name}) <= 100`),
  ]
);
