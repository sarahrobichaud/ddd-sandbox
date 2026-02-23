CREATE TABLE "core"."dead_letter_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" text NOT NULL,
	"event_name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"error" text NOT NULL,
	"attempt_count" integer NOT NULL,
	"failed_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL
);
