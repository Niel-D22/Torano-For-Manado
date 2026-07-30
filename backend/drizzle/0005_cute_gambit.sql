CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_avatar" text,
	"job_title" varchar(255) NOT NULL,
	"area" varchar(120),
	"price" numeric(12, 0),
	"scheduled_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"reviewer_name" varchar(255) NOT NULL,
	"reviewer_avatar" text,
	"rating" integer NOT NULL,
	"comment" text,
	"photos" text[],
	"job_title" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_review_rating" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5)
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_application_id" ON "bookings" USING btree ("worker_application_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reviews_application_id" ON "reviews" USING btree ("worker_application_id");