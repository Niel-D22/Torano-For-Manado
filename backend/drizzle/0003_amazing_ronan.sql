ALTER TABLE "worker_applications" ALTER COLUMN "nik" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_applications" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_applications" ALTER COLUMN "skill_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_applications" ALTER COLUMN "fixed_rate" DROP NOT NULL;