ALTER TABLE "core"."dead_letter_queue" ADD COLUMN "event_fingerprint" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."dead_letter_queue" DROP COLUMN "job_id";--> statement-breakpoint
ALTER TABLE "core"."dead_letter_queue" DROP COLUMN "retried_at";--> statement-breakpoint
ALTER TABLE "core"."dead_letter_queue" ADD CONSTRAINT "dead_letter_queue_event_fingerprint_unique" UNIQUE("event_fingerprint");