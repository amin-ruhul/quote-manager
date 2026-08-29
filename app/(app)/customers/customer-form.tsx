"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type CustomerFormState,
  saveCustomer,
} from "@/app/(app)/customers/actions";
import { Panel } from "@/components/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/db/schema";

const initialState: CustomerFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
  savedId: null,
};

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? "Saving…" : isNew ? "Add customer" : "Save changes"}
    </Button>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CustomerForm({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSaved?: (customerId: string) => void;
}) {
  const [state, formAction] = useActionState<CustomerFormState, FormData>(
    async (prevState, formData) => {
      const result = await saveCustomer(prevState, formData);
      if (result.savedAt) {
        toast.success(customer ? "Customer updated." : "Customer added.");
        if (result.savedId) onSaved?.(result.savedId);
        onClose();
      }
      return result;
    },
    initialState,
  );

  return (
    <Panel asChild>
      <form action={formAction} className="space-y-4" noValidate>
        <h2 className="font-semibold">
          {customer ? "Edit customer" : "New customer"}
        </h2>

        {customer ? (
          <input type="hidden" name="id" value={customer.id} />
        ) : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            error={state.fieldErrors.firstName}
          >
            <Input
              id="firstName"
              name="firstName"
              defaultValue={customer?.firstName ?? ""}
              required
              autoComplete="given-name"
              placeholder="John"
            />
          </Field>
          <Field id="lastName" label="Last name">
            <Input
              id="lastName"
              name="lastName"
              defaultValue={customer?.lastName ?? ""}
              autoComplete="family-name"
              placeholder="Doe"
            />
          </Field>
        </div>

        <Field id="company" label="Company">
          <Input
            id="company"
            name="company"
            defaultValue={customer?.company ?? ""}
            placeholder="Optional"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" label="Phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={customer?.phone ?? ""}
              placeholder="(555) 123-4567"
            />
          </Field>
          <Field id="email" label="Email" error={state.fieldErrors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              defaultValue={customer?.email ?? ""}
              placeholder="john@example.com"
            />
          </Field>
        </div>

        <Field id="address" label="Job address">
          <Textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={customer?.address ?? ""}
            placeholder="12 Anywhere St, Springfield"
          />
        </Field>

        <Field id="notes" label="Notes">
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={customer?.notes ?? ""}
            placeholder="Gate code, dog, best time to call…"
          />
        </Field>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
          <SubmitButton isNew={customer === null} />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
