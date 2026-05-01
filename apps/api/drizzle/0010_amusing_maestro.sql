CREATE TABLE "stock_batch_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_batch_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer NOT NULL,
	"purchase_order_item_id" integer NOT NULL,
	"quantity_received" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_batch_quantity_check" CHECK ("stock_batch_items"."quantity_received" > 0)
);
--> statement-breakpoint
ALTER TABLE "stock_batch" DROP CONSTRAINT "stock_batch_quantity_check";--> statement-breakpoint
ALTER TABLE "stock_batch" DROP CONSTRAINT "stock_batch_purchase_order_item_id_purchase_order_items_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_batch" ADD COLUMN "purchase_order_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_batch" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "stock_batch_items" ADD CONSTRAINT "stock_batch_items_batch_id_stock_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."stock_batch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batch_items" ADD CONSTRAINT "stock_batch_items_purchase_order_item_id_purchase_order_items_id_fk" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batch" ADD CONSTRAINT "stock_batch_purchase_order_id_purchase_order_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_batch" DROP COLUMN "purchase_order_item_id";--> statement-breakpoint
ALTER TABLE "stock_batch" DROP COLUMN "quantity_received";