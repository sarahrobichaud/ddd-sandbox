import {
  boolean,
  check,
  integer,
  pgTable,
  pgView,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { countries } from '#schema/core/location/countries.schema';
import { eq, sql } from 'drizzle-orm';
import { aliasedColumn } from '#schema/common';

export const provinces = pgTable(
  'province',
  {
    id: serial('id').primaryKey(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    unique('UQ_province_code_country_id').on(table.code, table.countryId),
    check('CK_province_code_length', sql`length(${table.code}) <= 10`),
    check('CK_province_name_length', sql`length(${table.name}) <= 100`),
  ]
);

export const vProvincesDetails = pgView('v_province_details').as((qb) =>
  qb
    .select({
      provinceId: provinces.id,
      name: provinces.name,
      code: provinces.code,
      isActive: provinces.isActive,
      countryId: aliasedColumn(provinces.countryId, 'country_id'),
      countryName: aliasedColumn(countries.name, 'country_name'),
      countryCode: aliasedColumn(countries.code, 'country_code'),
      countryCodeAlpha3: aliasedColumn(countries.codeAlpha3, 'country_code_alpha3'),
      countryPhoneCode: aliasedColumn(countries.phoneCode, 'country_phone_code'),
      countryIsActive: aliasedColumn(countries.isActive, 'country_is_active'),
    })
    .from(provinces)
    .innerJoin(countries, eq(provinces.countryId, countries.id))
);
