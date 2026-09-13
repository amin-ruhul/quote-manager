CREATE TABLE "upgrade_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid,
	"business_name" text,
	"source" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "upgrade_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "quota_period_start" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "upgrade_requests_user_id_idx" ON "upgrade_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_created_at_idx" ON "upgrade_requests" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "upgrade_requests_select_own" ON "upgrade_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("upgrade_requests"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "upgrade_requests_insert_own" ON "upgrade_requests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("upgrade_requests"."user_id" = (select auth.uid()));