"use client";

import Link from "next/link";
import { toast } from "sonner";

import {
  type CustomerFormState,
  saveCustomer,
} from "@/app/(app)/customers/actions";
import { Panel } from "@/components/panel";
import { SwitchField } from "@/components/switch-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/db/schema";
import { type CustomerFields, customerSchema } from "@/lib/schemas/customer";
import { useActionForm } from "@/lib/use-action-form";

const initialState: CustomerFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
  savedId: null,
  duplicate: null,
};

/**
 * The way out of a duplicate. The field's own message says only that a customer
 * with this email or phone exists; this is how the owner goes and looks at
 * them, which is nearly always what they wanted instead of a second record.
 */
function DuplicateLink({
  duplicate,
  field,
}: {
  duplicate: CustomerFormState["duplicate"];
  field: "email" | "phone";
}) {
  if (duplicate?.field !== field) return null;

  return (
    <Link
      href={`/customers/${duplicate.id}`}
      className="inline-block text-sm font-medium text-brand underline underline-offset-2"
    >
      Open that customer
    </Link>
  );
}

function defaultsFor(customer: Customer | null): CustomerFields {
  return {
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    company: customer?.company ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
    notes: customer?.notes ?? "",
    taxExempt: customer?.taxExempt ? "true" : "false",
  };
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
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: customerSchema,
    defaultValues: defaultsFor(customer),
    initialState,
    action: async (prevState, formData) => {
      const result = await saveCustomer(prevState, formData);
      if (result.savedAt) {
        toast.success(customer ? "Customer updated." : "Customer added.");
        if (result.savedId) onSaved?.(result.savedId);
        onClose();
      }
      return result;
    },
  });

  return (
    // FormProvider renders no DOM of its own, so it sits outside the Panel —
    // Panel's asChild needs a real element (the <form>) to merge into.
    <Form {...form}>
      <Panel asChild>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="given-name"
                      placeholder="John"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="family-name"
                      placeholder="Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="(555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage />
                  <DuplicateLink duplicate={state.duplicate} field="phone" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      placeholder="john@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                  <DuplicateLink duplicate={state.duplicate} field="email" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job address</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="12 Anywhere St, Springfield"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="Gate code, dog, best time to call…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxExempt"
            render={({ field }) => (
              <SwitchField
                name={field.name}
                value={field.value ?? "false"}
                onChange={field.onChange}
                label="Tax exempt"
                hint="No sales tax on this customer's quotes."
              />
            )}
          />

          <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              loading={isPending}
            >
              {isPending
                ? "Saving…"
                : customer
                  ? "Save changes"
                  : "Add customer"}
            </Button>
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
    </Form>
  );
}
