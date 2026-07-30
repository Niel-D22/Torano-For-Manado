CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"payout_account_id" uuid,
	"amount" numeric(12, 0) NOT NULL,
	"status" varchar(30) DEFAULT 'paid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_payout_account_id_payout_accounts_id_fk" FOREIGN KEY ("payout_account_id") REFERENCES "public"."payout_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_withdrawals_application_id" ON "withdrawals" USING btree ("worker_application_id");