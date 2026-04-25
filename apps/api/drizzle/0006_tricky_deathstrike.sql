ALTER TABLE "purchase_order" ADD COLUMN "status" text DEFAULT 'ORDERED' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order" DROP COLUMN "total_amount";