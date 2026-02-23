ALTER TABLE "core"."onboarding_progress" ALTER COLUMN "current_step" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "core"."onboarding_progress" ALTER COLUMN "current_step" SET DEFAULT 'WELCOME'::text;--> statement-breakpoint
DROP TYPE "public"."onboarding_step";--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('WELCOME', 'PRESENCE', 'COMPLETED', 'SETUP_PRESENCE_CREATED', 'READY');--> statement-breakpoint
ALTER TABLE "core"."onboarding_progress" ALTER COLUMN "current_step" SET DEFAULT 'WELCOME'::"public"."onboarding_step";--> statement-breakpoint
ALTER TABLE "core"."onboarding_progress" ALTER COLUMN "current_step" SET DATA TYPE "public"."onboarding_step" USING "current_step"::"public"."onboarding_step";