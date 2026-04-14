ALTER TABLE "product" DROP CONSTRAINT "min_stock_level_check";--> statement-breakpoint
ALTER TABLE "stock" ADD COLUMN "min_stock_level" integer;--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "min_stock_level";--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "min_stock_level_check" CHECK ("stock"."min_stock_level" > 0);--> statement-breakpoint
ALTER TABLE "stock_batch" ADD CONSTRAINT "stock_batch_quantity_check" CHECK ("stock_batch"."quantity_received" > 0);