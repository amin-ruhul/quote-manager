"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type BusinessFormState,
  emptyBusinessFormState,
  saveBusinessProfile,
} from "@/app/(app)/onboarding/actions";
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
import { CURRENCIES } from "@/lib/constants";
import type { Business } from "@/db/schema";
import { basisPointsToPercent } from "@/lib/money";

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
      {hint && !error ? <p className="text-sm text-ink-40">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
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
    emptyBusinessFormState,
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    business?.logoUrl ?? null,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Field id="name" label="Business name" error={state.fieldErrors.name}>
        <Input
          id="name"
          name="name"
          defaultValue={business?.name ?? ""}
          required
          placeholder="Bright Spark Electric"
          autoComplete="organization"
        />
      </Field>

      <Field
        id="logo"
        label="Logo"
        hint="PNG, JPG, or WebP, up to 2 MB. Appears on every quote you send."
      >
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Your current logo"
              width={56}
              height={56}
              unoptimized
              className="size-14 rounded-md border border-hairline bg-surface object-contain"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-md border border-hairline bg-surface-2 text-xs text-ink-40">
              None
            </div>
          )}
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="flex-1"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setLogoPreview(
                file ? URL.createObjectURL(file) : (business?.logoUrl ?? null),
              );
            }}
          />
        </div>
      </Field>

      <Field id="phone" label="Phone" error={state.fieldErrors.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={business?.phone ?? ""}
          placeholder="(555) 123-4567"
        />
      </Field>

      <Field id="email" label="Contact email" error={state.fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          defaultValue={business?.email ?? ""}
          placeholder="hello@brightspark.com"
        />
      </Field>

      <Field id="website" label="Website" error={state.fieldErrors.website}>
        <Input
          id="website"
          name="website"
          defaultValue={business?.website ?? ""}
          placeholder="brightspark.com"
        />
      </Field>

      <Field id="address" label="Address" error={state.fieldErrors.address}>
        <Textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={business?.address ?? ""}
          placeholder="12 Anywhere St, Springfield"
        />
      </Field>

      <Field
        id="licenseNumber"
        label="License number"
        hint="Shown on your quotes — homeowners look for it."
        error={state.fieldErrors.licenseNumber}
      >
        <Input
          id="licenseNumber"
          name="licenseNumber"
          defaultValue={business?.licenseNumber ?? ""}
          placeholder="EC-123456"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="currency" label="Currency">
          <Select name="currency" defaultValue={business?.currency ?? "USD"}>
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
            defaultValue={basisPointsToPercent(business?.defaultTaxRate ?? 0)}
            placeholder="8.25"
          />
        </Field>
      </div>

      <SubmitButton isNew={business === null} />
    </form>
  );
}
