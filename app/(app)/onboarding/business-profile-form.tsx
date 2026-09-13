"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  type BusinessFormState,
  saveBusinessProfile,
} from "@/app/(app)/onboarding/actions";
import { QuoteHeaderPreview } from "@/app/(app)/onboarding/quote-header-preview";
import { Panel } from "@/components/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Business } from "@/db/schema";
import { CURRENCIES, DEFAULT_CURRENCY, followUpDaysFor } from "@/lib/constants";
import { basisPointsToPercent } from "@/lib/money";
import {
  type BusinessProfileFields,
  businessProfileSchema,
} from "@/lib/schemas/business";
import { useActionForm } from "@/lib/use-action-form";

const initialState: BusinessFormState = { error: null, fieldErrors: {} };

function defaultsFor(
  business: Business | null,
  ownerEmail: string,
): BusinessProfileFields {
  return {
    name: business?.name ?? "",
    licenseNumber: business?.licenseNumber ?? "",
    phone: business?.phone ?? "",
    /*
     * Prefilled with the address they signed in with.
     *
     * This field is not decoration: lib/notify-owner.ts sends every "opened"
     * and "accepted" alert to it in preference to the login email. Left blank,
     * it invites whatever a password manager offers — and a wrong address here
     * fails silently, because a bounce is asynchronous and nothing in the app
     * ever learns about it. `||` rather than `??` so a saved-but-empty value
     * falls back too.
     */
    email: business?.email || ownerEmail,
    website: business?.website ?? "",
    address: business?.address ?? "",
    currency: business?.currency ?? DEFAULT_CURRENCY,
    followUpDays: String(followUpDaysFor(business?.settings)),
    defaultTaxRate: basisPointsToPercent(business?.defaultTaxRate ?? 0),
  };
}

/**
 * One group of related fields.
 *
 * The form used to be nine fields in a single card, which asked the owner to
 * read the whole thing to find the one line they came to change. Three groups
 * also fix a copy problem: the follow-up delay is automation, not something
 * printed on a quote, so it could never sit honestly under one heading with the
 * business name.
 */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Panel asChild>
      <section>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink-60">{description}</p>
        <div className="mt-6 space-y-6">{children}</div>
      </section>
    </Panel>
  );
}

export function BusinessProfileForm({
  business,
  ownerEmail,
}: {
  business: Business | null;
  /** The address they signed in with; the contact email defaults to it. */
  ownerEmail: string;
}) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: businessProfileSchema,
    defaultValues: defaultsFor(business, ownerEmail),
    initialState,
    action: async (prevState, formData) => {
      const result = await saveBusinessProfile(prevState, formData);
      if (!result.error && business) toast.success("Business profile saved.");
      return result;
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    business?.logoUrl ?? null,
  );

  // Tracks an explicit removal so the server can tell "left it alone" apart
  // from "cleared it" — both arrive as an empty file input otherwise.
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoName, setLogoName] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /*
   * Only the fields the customer actually sees are watched, so the preview
   * follows them as they are typed without the rest of the form re-rendering on
   * every keystroke in a box nobody outside the business will ever read.
   */
  const [name, licenseNumber, phone, email, website] = useWatch({
    control: form.control,
    name: ["name", "licenseNumber", "phone", "email", "website"],
  });

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8"
        noValidate
      >
        <div className="space-y-6">
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <Section
            title="Identity"
            description="The masthead on every quote you send."
          >
            {/* Name and licence are one thought — who you are — so they pair
                up as soon as the column is wide enough to hold both. */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Bright Spark Electric"
                        autoComplete="organization"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EC-123456" />
                    </FormControl>
                    <FormMessage>Homeowners look for this one.</FormMessage>
                  </FormItem>
                )}
              />
            </div>

            {/*
              The logo is a file, not a schema field: it never round-trips as a
              string, so it stays outside React Hook Form and rides along in the
              FormData the action receives.
            */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>

              {/*
                An empty file input is indistinguishable from "didn't touch it",
                so removal needs its own flag rather than being inferred
                server-side.
              */}
              {logoRemoved ? (
                <input type="hidden" name="removeLogo" value="1" />
              ) : null}

              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Your current logo"
                    width={56}
                    height={56}
                    unoptimized
                    className="size-14 shrink-0 rounded-md border border-hairline bg-surface object-contain"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-2 text-xs text-ink-60">
                    None
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/*
                      The native file input is visually hidden rather than styled:
                      "Choose file / No file chosen" cannot be restyled across
                      browsers, and at full width it dwarfed the 56px thumbnail it
                      sat next to. The label is the button; `peer` carries the
                      input's focus ring onto it so keyboard use still reads.
                    */}
                    <input
                      ref={logoInputRef}
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="peer sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        // Choosing a file undoes a pending removal — the owner
                        // clearly meant to replace, not to clear.
                        if (file) setLogoRemoved(false);
                        setLogoName(file?.name ?? null);
                        setLogoPreview(
                          file
                            ? URL.createObjectURL(file)
                            : logoRemoved
                              ? null
                              : (business?.logoUrl ?? null),
                        );
                      }}
                    />
                    <label
                      htmlFor="logo"
                      className="inline-flex h-9 cursor-pointer items-center rounded-md bg-brand-wash px-3 text-sm font-medium text-brand transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-brand/50 hover:bg-brand-wash/70"
                    >
                      {logoPreview ? "Replace" : "Choose image"}
                    </label>

                    {logoPreview ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          // Clearing the input matters: without it the browser
                          // keeps submitting the previously chosen file.
                          if (logoInputRef.current) {
                            logoInputRef.current.value = "";
                          }
                          setLogoName(null);
                          setLogoPreview(null);
                          setLogoRemoved(true);
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>

                  <p className="mt-1.5 truncate text-xs text-ink-60">
                    {logoRemoved
                      ? "Will be removed when you save."
                      : (logoName ??
                        (logoPreview ? "Current logo" : "No file chosen"))}
                  </p>
                </div>
              </div>

              <p className="text-sm text-ink-60">
                PNG, JPG, or WebP, up to 2 MB.
              </p>
            </div>
          </Section>

          <Section
            title="Contact"
            description="How a customer reaches you after they read the quote."
          >
            {/* Phone and email are the two a customer actually taps, so they lead
              and share a row. Address sits with them but is flagged: it is the
              one contact field the quote never prints. */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(555) 123-4567"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        inputMode="email"
                        placeholder="hello@brightspark.com"
                      />
                    </FormControl>
                    <FormDescription>
                      Where we tell you a customer opened or accepted a quote —
                      and the address they see on it. Make sure you read it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="brightspark.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="12 Anywhere St, Springfield"
                      />
                    </FormControl>
                    <FormMessage>
                      Your records only — never on the quote.
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
          </Section>

          <Section
            title="Quote defaults"
            description="What every new quote starts from, and what happens if one goes quiet."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultTaxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default tax rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="decimal"
                        className="tabular"
                        placeholder="8.25"
                      />
                    </FormControl>
                    <FormMessage>
                      Leave at 0 if you don&apos;t charge tax.
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="followUpDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow up on unanswered quotes</FormLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2">After 2 days</SelectItem>
                      <SelectItem value="5">After 5 days</SelectItem>
                      <SelectItem value="0">Don&apos;t follow up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    We&apos;ll send one friendly nudge if a sent quote
                    hasn&apos;t been accepted. Nudges stop as soon as it is.
                  </FormMessage>
                </FormItem>
              )}
            />
          </Section>

          {/* Full width on a phone where it is the thumb target, its own size
              from sm up — a blue bar across the whole form reads as heavier
              than the action is. */}
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            loading={isPending}
          >
            {isPending
              ? "Saving…"
              : business === null
                ? "Save and continue"
                : "Save changes"}
          </Button>
        </div>

        {/*
          Second in the DOM so the form itself comes first for a keyboard or
          screen-reader user, but hoisted above the fields on a phone — the
          preview is the reason this page exists, and it should not be buried
          under nine inputs on the screen the owner actually uses.
        */}
        <div className="order-first lg:sticky lg:top-8 lg:order-none">
          <QuoteHeaderPreview
            name={name}
            logoUrl={logoPreview}
            licenseNumber={licenseNumber}
            phone={phone}
            email={email}
            website={website}
          />
        </div>
      </form>
    </Form>
  );
}
