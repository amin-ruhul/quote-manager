CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"company" text,
	"phone" text,
	"email" text,
	"address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"option_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 100 NOT NULL,
	"unit" text NOT NULL,
	"unit_price" integer NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"type" text DEFAULT 'qty' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total" integer DEFAULT 0 NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_options" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"quote_number" text NOT NULL,
	"title" text NOT NULL,
	"scope_of_work" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"tax_rate" integer DEFAULT 0 NOT NULL,
	"valid_until" timestamp with time zone,
	"public_token" text NOT NULL,
	"terms" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_path" text,
	"caption" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quote_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"type" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_option_id_quote_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."quote_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_options" ADD CONSTRAINT "quote_options_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_attachments" ADD CONSTRAINT "quote_attachments_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_business_id_idx" ON "customers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_items_option_id_idx" ON "quote_items" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "quote_options_quote_id_idx" ON "quote_options" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quotes_business_id_idx" ON "quotes" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "quotes_customer_id_idx" ON "quotes" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_public_token_idx" ON "quotes" USING btree ("public_token");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_business_number_idx" ON "quotes" USING btree ("business_id","quote_number");--> statement-breakpoint
CREATE INDEX "quote_attachments_quote_id_idx" ON "quote_attachments" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_events_quote_id_idx" ON "quote_events" USING btree ("quote_id");--> statement-breakpoint
CREATE POLICY "customers_all_own_business" ON "customers" AS PERMISSIVE FOR ALL TO "authenticated" USING ("customers"."business_id" in (select id from businesses where owner_id = (select auth.uid()))) WITH CHECK ("customers"."business_id" in (select id from businesses where owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "quote_items_all_own_quote" ON "quote_items" AS PERMISSIVE FOR ALL TO "authenticated" USING ("quote_items"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid())))) WITH CHECK ("quote_items"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid()))));--> statement-breakpoint
CREATE POLICY "quote_options_all_own_quote" ON "quote_options" AS PERMISSIVE FOR ALL TO "authenticated" USING ("quote_options"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid())))) WITH CHECK ("quote_options"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid()))));--> statement-breakpoint
CREATE POLICY "quotes_all_own_business" ON "quotes" AS PERMISSIVE FOR ALL TO "authenticated" USING ("quotes"."business_id" in (select id from businesses where owner_id = (select auth.uid()))) WITH CHECK ("quotes"."business_id" in (select id from businesses where owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "quote_attachments_all_own_quote" ON "quote_attachments" AS PERMISSIVE FOR ALL TO "authenticated" USING ("quote_attachments"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid())))) WITH CHECK ("quote_attachments"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid()))));--> statement-breakpoint
CREATE POLICY "quote_events_select_own_quote" ON "quote_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("quote_events"."quote_id" in (select id from quotes where business_id in (select id from businesses where owner_id = (select auth.uid()))));