ALTER TABLE "purchase_order" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "deleted_at" timestamp;