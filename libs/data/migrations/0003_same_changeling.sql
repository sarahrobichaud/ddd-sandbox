ALTER TABLE "core"."dead_letter_queue" ADD COLUMN "retried_at" timestamp;--> statement-breakpoint
ALTER TABLE "core"."dead_letter_queue" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;