CREATE TYPE "public"."user_role" AS ENUM('customer', 'worker', 'admin');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"avatar_url" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"account_status" varchar(30) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "worker_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"nik" varchar(20) NOT NULL,
	"category_id" uuid NOT NULL,
	"skill_description" text NOT NULL,
	"fixed_rate" numeric(12, 0) NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(10, 6),
	"profile_photo_url" text,
	"selfie_photo_url" text,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_latitude" CHECK ("worker_applications"."latitude" IS NULL OR ("worker_applications"."latitude" >= -90 AND "worker_applications"."latitude" <= 90)),
	CONSTRAINT "chk_longitude" CHECK ("worker_applications"."longitude" IS NULL OR ("worker_applications"."longitude" >= -180 AND "worker_applications"."longitude" <= 180))
);
--> statement-breakpoint
CREATE TABLE "worker_portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_application_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"relationship" varchar(100) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_portfolios" ADD CONSTRAINT "worker_portfolios_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_references" ADD CONSTRAINT "worker_references_worker_application_id_worker_applications_id_fk" FOREIGN KEY ("worker_application_id") REFERENCES "public"."worker_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_slug" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_categories_is_active" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_profiles_auth_user_id" ON "profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_email" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_worker_applications_profile_id" ON "worker_applications" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_worker_applications_category_id" ON "worker_applications" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_worker_applications_status" ON "worker_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_worker_portfolios_application_id" ON "worker_portfolios" USING btree ("worker_application_id");--> statement-breakpoint
CREATE INDEX "idx_worker_references_application_id" ON "worker_references" USING btree ("worker_application_id");