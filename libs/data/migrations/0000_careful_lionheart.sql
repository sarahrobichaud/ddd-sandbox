CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('USER', 'SYSTEM', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."aviation_experience" AS ENUM('HOBBYIST', 'REAL_PILOT', 'NO_EXPERIENCE');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('WELCOME', 'PRESENCE', 'COMPLETED', 'READY');--> statement-breakpoint
CREATE TYPE "public"."profile_kind" AS ENUM('PRIMARY', 'COMMUNITY');--> statement-breakpoint
CREATE TYPE "public"."ref_type" AS ENUM('USER', 'PROFILE');--> statement-breakpoint
CREATE TYPE "public"."simulator_type" AS ENUM('FSX', 'P3D', 'XPLANE', 'MSFS2020', 'MSFS2024');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."user_account_type" AS ENUM('PRIMARY', 'COMMUNITY');--> statement-breakpoint
CREATE TYPE "auth"."auth_provider_type" AS ENUM('EMAIL_PASSWORD', 'MAGIC_LINK', 'DISCORD');--> statement-breakpoint
CREATE TABLE "auth"."passwords" (
	"auth_provider_id" uuid PRIMARY KEY NOT NULL,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."auth_providers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_type" "auth"."auth_provider_type" NOT NULL,
	"provider_user_id" text NOT NULL,
	"email" text,
	"access_token" text,
	"refresh_token" text,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "unique_user_provider" UNIQUE("user_id","provider_type"),
	CONSTRAINT "unique_provider_user_id" UNIQUE("provider_user_id","provider_type")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"primary_profile_id" uuid,
	"status" text DEFAULT 'ACTIVE',
	"primary_email" text NOT NULL,
	"username" text NOT NULL,
	"username_discriminator" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "users_primary_email_unique" UNIQUE("primary_email"),
	CONSTRAINT "unique_username_per_discriminator" UNIQUE("username","username_discriminator")
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" text NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone DEFAULT NULL,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."presence" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'Preparing for takeoff' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "unique_presence_user_id" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "core"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_presence_id" uuid NOT NULL,
	"profile_kind" "profile_kind" NOT NULL,
	"organization_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"pronouns" text NOT NULL,
	"username" text NOT NULL,
	"home_airport" text NOT NULL,
	"aviation_experience" "aviation_experience" NOT NULL,
	"simulator_type" "simulator_type" NOT NULL,
	"skill_level" "skill_level" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "unique_display_name_per_org" UNIQUE("organization_id","username")
);
--> statement-breakpoint
CREATE TABLE "core"."organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "core"."onboarding_progress" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"current_step" "onboarding_step" DEFAULT 'WELCOME' NOT NULL,
	"completed_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"presence_data" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "onboarding_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"street_address_1" text NOT NULL,
	"street_address_2" text,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"province_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "province" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "UQ_province_code_country_id" UNIQUE("code","country_id"),
	CONSTRAINT "CK_province_code_length" CHECK (length("province"."code") <= 10),
	CONSTRAINT "CK_province_name_length" CHECK (length("province"."name") <= 100)
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"code_alpha3" text NOT NULL,
	"phone_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code"),
	CONSTRAINT "countries_code_alpha3_unique" UNIQUE("code_alpha3"),
	CONSTRAINT "CK_country_code_length" CHECK (length("countries"."code") = 2),
	CONSTRAINT "CK_country_code_alpha3_length" CHECK (length("countries"."code_alpha3") = 3),
	CONSTRAINT "CK_country_phone_code_length" CHECK (length("countries"."phone_code") <= 10),
	CONSTRAINT "CK_country_name_length" CHECK (length("countries"."name") <= 100)
);
--> statement-breakpoint
ALTER TABLE "auth"."passwords" ADD CONSTRAINT "passwords_auth_provider_id_auth_providers_id_fk" FOREIGN KEY ("auth_provider_id") REFERENCES "auth"."auth_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."auth_providers" ADD CONSTRAINT "auth_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."presence" ADD CONSTRAINT "presence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."profiles" ADD CONSTRAINT "profiles_user_presence_id_presence_id_fk" FOREIGN KEY ("user_presence_id") REFERENCES "core"."presence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."profiles" ADD CONSTRAINT "fk_profiles_user_presence_id" FOREIGN KEY ("user_presence_id") REFERENCES "core"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."organizations" ADD CONSTRAINT "organizations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_province_id_province_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."province"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "province" ADD CONSTRAINT "province_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_providers_user_id" ON "auth"."auth_providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_user_presence_id" ON "core"."profiles" USING btree ("user_presence_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_organization_id" ON "core"."profiles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_user_id" ON "core"."onboarding_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_completed" ON "core"."onboarding_progress" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "idx_onboarding_current_step" ON "core"."onboarding_progress" USING btree ("current_step");--> statement-breakpoint
CREATE VIEW "public"."active_addresses" AS (select "id", "organization_id", "street_address_1", "street_address_2", "city", "postal_code", "province_id", "country_id", "latitude", "longitude", "created_at", "deleted_at", "updated_at", "version" from "addresses" where "addresses"."deleted_at" is null);--> statement-breakpoint
CREATE VIEW "public"."v_addresses_details" AS (select "active_addresses"."id", "active_addresses"."street_address_1", "active_addresses"."street_address_2", "active_addresses"."city", "active_addresses"."postal_code", "province"."name" as "province_name", "province"."code" as "province_code", "countries"."name" as "country_name", "countries"."code" as "country_code", "active_addresses"."latitude", "active_addresses"."longitude" from "active_addresses" inner join "province" on "active_addresses"."province_id" = "province"."id" inner join "countries" on "active_addresses"."country_id" = "countries"."id");--> statement-breakpoint
CREATE VIEW "public"."v_province_details" AS (select "province"."id", "province"."name", "province"."code", "province"."is_active", "province"."country_id" as "country_id", "countries"."name" as "country_name", "countries"."code" as "country_code", "countries"."code_alpha3" as "country_code_alpha3", "countries"."phone_code" as "country_phone_code", "countries"."is_active" as "country_is_active" from "province" inner join "countries" on "province"."country_id" = "countries"."id");