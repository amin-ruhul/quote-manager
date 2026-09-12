ALTER TABLE "pricebook_items" ADD COLUMN "taxable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "tax_exempt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_items" ADD COLUMN "taxable" boolean DEFAULT true NOT NULL;