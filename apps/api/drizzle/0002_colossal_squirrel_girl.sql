ALTER TABLE "user" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "item" DROP COLUMN "status";