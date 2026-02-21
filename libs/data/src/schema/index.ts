/**
 * Common
 */

export * from "#schemas";
export * from "#schema/common";

/**
 * Infrastructure
 */
export * from "#schema/core/infra/dql.schema";

/**
 * Authentication
 */
export * from "#schema/auth/passwords.schema";
export * from "#schema/auth/auth-provider.schema";
export * from "#schema/auth/users.schema";
export * from "#schema/auth/sessions.schema";

/**
 * Presence
 */
export * from "#schema/core/presence/presence.schema";
export * from "#schema/core/presence/profiles.schema";

/**
 * Core
 */

export * from "#schema/core/organizations.schema";
export * from "#schema/core/onboarding.schema";

/**
 * Location
 */
export * from "#schema/core/location/addresses.schema";
export * from "#schema/core/location/provinces.schema";
export * from "#schema/core/location/countries.schema";
