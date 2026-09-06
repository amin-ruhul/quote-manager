"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type BusinessFormState,
  saveBusinessProfile,
} from "@/app/(app)/onboarding/actions";
import { QuoteHeaderPreview } from "@/app/(app)/onboarding/quote-header-preview";
import { Panel } from "@/components/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { CURRENCIES, followUpDaysFor } from "@/lib/constants";
import type { Business } from "@/db/schema";
import { basisPointsToPercent } from "@/lib/money";

const initialState: BusinessFormState = { error: null, fieldErrors: {} };

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-sm text-ink-60">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
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

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    // Full width on a phone where it is the thumb target, its own size from sm
    // up — a blue bar across the whole form reads as heavier than the action is.
    <Button
      type="submit"
      size="lg"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? "Saving…" : isNew ? "Save and continue" : "Save changes"}
    </Button>
  );
}

export function BusinessProfileForm({
  business,
}: {
  business: Business | null;
}) {
  const [state, formAction] = useActionState<BusinessFormState, FormData>(
    async (prevState, formData) => {
      const result = await saveBusinessProfile(prevState, formData);
      if (!result.error && business) toast.success("Business profile saved.");
      return result;
    },
    initialState,
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    business?.logoUrl ?? null,
  );

  // Tracks an explicit removal so the server can tell "left it alone" apart
  // from "cleared it" — both arrive as an empty file input otherwise.
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoName, setLogoName] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /*
   * The fields the customer actually sees are controlled, so the preview can
   * follow them as they are typed. Everything else stays uncontrolled — there
   * is no reason to re-render the form on every keystroke in a field nobody
   * outside the business will ever read.
   */
  const [shown, setShown] = useState({
    name: business?.name ?? "",
    licenseNumber: business?.licenseNumber ?? "",
    phone: business?.phone ?? "",
    email: business?.email ?? "",
    website: business?.website ?? "",
  });

  const set = (key: keyof typeof shown) => (value: string) =>
    setShown((previous) => ({ ...previous, [key]: value }));

  return (
    <form
      action={formAction}
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
            <Field
              id="name"
              label="Business name"
              error={state.fieldErrors.name}
            >
              <Input
                id="name"
                name="name"
                value={shown.name}
                onChange={(event) => set("name")(event.target.value)}
                required
                placeholder="Bright Spark Electric"
                autoComplete="organization"
              />
            </Field>

            <Field
              id="licenseNumber"
              label="License number"
              hint="Homeowners look for this one."
              error={state.fieldErrors.licenseNumber}
            >
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={shown.licenseNumber}
                onChange={(event) => set("licenseNumber")(event.target.value)}
                placeholder="EC-123456"
              />
            </Field>
          </div>

          <Field id="logo" label="Logo" hint="PNG, JPG, or WebP, up to 2 MB.">
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
          </Field>
        </Section>

        <Section
          title="Contact"
          description="How a customer reaches you after they read the quote."
        >
          {/* Phone and email are the two a customer actually taps, so they lead
            and share a row. Address sits with them but is flagged: it is the
            one contact field the quote never prints. */}
          <div className="grid gap-6 md:grid-cols-2">
            <Field id="phone" label="Phone" error={state.fieldErrors.phone}>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={shown.phone}
                onChange={(event) => set("phone")(event.target.value)}
                placeholder="(555) 123-4567"
              />
            </Field>

            <Field
              id="email"
              label="Contact email"
              error={state.fieldErrors.email}
            >
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                value={shown.email}
                onChange={(event) => set("email")(event.target.value)}
                placeholder="hello@brightspark.com"
              />
            </Field>

            <Field
              id="website"
              label="Website"
              error={state.fieldErrors.website}
            >
              <Input
                id="website"
                name="website"
                value={shown.website}
                onChange={(event) => set("website")(event.target.value)}
                placeholder="brightspark.com"
              />
            </Field>

            <Field
              id="address"
              label="Address"
              hint="Your records only — never on the quote."
              error={state.fieldErrors.address}
            >
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={business?.address ?? ""}
                placeholder="12 Anywhere St, Springfield"
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Quote defaults"
          description="What every new quote starts from, and what happens if one goes quiet."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="currency" label="Currency">
              <Select
                name="currency"
                defaultValue={business?.currency ?? "USD"}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="defaultTaxRate"
              label="Default tax rate (%)"
              hint="Leave at 0 if you don't charge tax."
              error={state.fieldErrors.defaultTaxRate}
            >
              <Input
                id="defaultTaxRate"
                name="defaultTaxRate"
                inputMode="decimal"
                className="tabular"
                defaultValue={basisPointsToPercent(
                  business?.defaultTaxRate ?? 0,
                )}
                placeholder="8.25"
              />
            </Field>
          </div>

          <Field
            id="followUpDays"
            label="Follow up on unanswered quotes"
            hint="We'll send one friendly nudge if a sent quote hasn't been accepted. Nudges stop as soon as it is."
            error={state.fieldErrors.followUpDays}
          >
            <Select
              name="followUpDays"
              defaultValue={String(followUpDaysFor(business?.settings))}
            >
              <SelectTrigger id="followUpDays" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">After 2 days</SelectItem>
                <SelectItem value="5">After 5 days</SelectItem>
                <SelectItem value="0">Don&apos;t follow up</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <SubmitButton isNew={business === null} />
      </div>

      {/*
        Second in the DOM so the form itself comes first for a keyboard or
        screen-reader user, but hoisted above the fields on a phone — the
        preview is the reason this page exists, and it should not be buried
        under nine inputs on the screen the owner actually uses.
      */}
      <div className="order-first lg:sticky lg:top-8 lg:order-none">
        <QuoteHeaderPreview
          name={shown.name}
          logoUrl={logoPreview}
          licenseNumber={shown.licenseNumber}
          phone={shown.phone}
          email={shown.email}
          website={shown.website}
        />
      </div>
    </form>
  );
}
