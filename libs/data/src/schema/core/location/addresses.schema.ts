import { bigserial, decimal, integer, pgTable, pgView, text, uuid } from 'drizzle-orm/pg-core';
import { aliasedColumn, COMMON_COLUMNS } from '#schema/common';
import { provinces } from '#schema/core/location/provinces.schema';
import { countries } from '#schema/core/location/countries.schema';
import { eq, isNull } from 'drizzle-orm';
import { organizations } from '#schema/core/organizations.schema';

export const address = pgTable('addresses', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  streetAddress1: text('street_address_1').notNull(),
  streetAddress2: text('street_address_2'),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  provinceId: integer('province_id')
    .notNull()
    .references(() => provinces.id),
  countryId: integer('country_id')
    .notNull()
    .references(() => countries.id),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  ...COMMON_COLUMNS,
});

export const activeAddress = pgView('active_addresses').as((qb) => {
  return qb.select().from(address).where(isNull(address.deletedAt));
});

export const vAddressDetails = pgView('v_addresses_details').as((qb) =>
  qb
    .select({
      id: activeAddress.id,
      streetAddress1: activeAddress.streetAddress1,
      streetAddress2: activeAddress.streetAddress2,
      city: activeAddress.city,
      postalCode: activeAddress.postalCode,
      provinceName: aliasedColumn(provinces.name, 'province_name'),
      provinceCode: aliasedColumn(provinces.code, 'province_code'),
      countryName: aliasedColumn(countries.name, 'country_name'),
      countryCode: aliasedColumn(countries.code, 'country_code'),
      latitude: activeAddress.latitude,
      longitude: activeAddress.longitude,
    })
    .from(activeAddress)
    .innerJoin(provinces, eq(activeAddress.provinceId, provinces.id))
    .innerJoin(countries, eq(activeAddress.countryId, countries.id))
);
