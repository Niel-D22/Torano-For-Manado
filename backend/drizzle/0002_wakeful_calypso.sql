CREATE TABLE "payout_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"provider" varchar(100) NOT NULL,
	"account_number" varchar(60) NOT NULL,
	"account_holder" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "working_hours" jsonb;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "rating_avg" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "jobs_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "completion_rate" integer;--> statement-breakpoint
ALTER TABLE "payout_accounts" ADD CONSTRAINT "payout_accounts_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payout_accounts_application_id" ON "payout_accounts" USING btree ("worker_application_id");