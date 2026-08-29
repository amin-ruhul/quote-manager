CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"phone" text,
	"email" text,
	"website" text,
	"address" text,
	"license_number" text,
	"industry" text DEFAULT 'electrician' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"default_tax_rate" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "industry_config" (
	"industry" text PRIMARY KEY NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"default_pricebook" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_instructions" text DEFAULT '' NOT NULL,
	"default_terms" text DEFAULT '' NOT NULL,
	"quote_wording" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "industry_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pricebook_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"unit" text DEFAULT 'each' NOT NULL,
	"price" integer NOT NULL,
	"cost" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pricebook_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"paddle_customer_id" text,
	"quotes_used_this_month" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricebook_items" ADD CONSTRAINT "pricebook_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "businesses_owner_id_idx" ON "businesses" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "pricebook_items_business_id_idx" ON "pricebook_items" USING btree ("business_id");--> statement-breakpoint
CREATE POLICY "businesses_all_own" ON "businesses" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "businesses"."owner_id") WITH CHECK ((select auth.uid()) = "businesses"."owner_id");--> statement-breakpoint
CREATE POLICY "industry_config_select_all" ON "industry_config" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "pricebook_items_all_own_business" ON "pricebook_items" AS PERMISSIVE FOR ALL TO "authenticated" USING ("pricebook_items"."business_id" in (select id from businesses where owner_id = (select auth.uid()))) WITH CHECK ("pricebook_items"."business_id" in (select id from businesses where owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "profiles_select_own" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "profiles_update_own" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "profiles_insert_own" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = id);