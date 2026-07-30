ALTER TABLE "worker_applications" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "skills" text[];--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "service_areas" text[];--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "rate_max" numeric(12, 0);--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "worker_references" ADD COLUMN "contacted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_references" ADD COLUMN "admin_note" text;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;