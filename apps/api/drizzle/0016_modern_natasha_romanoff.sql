ALTER TABLE "audit_log" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "status" text NOT NULL;