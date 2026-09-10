"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";

import { type RegisterState, register } from "@/app/register/actions";
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
import { registerSchema } from "@/lib/schemas/auth";
import { useActionForm } from "@/lib/use-action-form";

const initialState: RegisterState = {
  error: null,
  fieldErrors: {},
  checkEmail: false,
};

export function RegisterForm({ next }: { next: string }) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: registerSchema,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      next,
    },
    initialState,
    action: register,
  });

  /*
   * The account exists and the only thing left is in their inbox. Replacing the
   * form says that far more clearly than a message above fields they might try
   * to submit again.
   */
  if (state.checkEmail) {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-pill bg-status-accepted-bg">
          <MailCheck className="size-5 text-status-accepted" />
        </div>
        <h2 className="font-semibold">Check your email</h2>
        <p className="text-sm text-ink-60">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-foreground">
            {form.getValues("email")}
          </span>
          . Open it to finish setting up your account.
        </p>
        <Button asChild variant="soft" size="lg" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="name" placeholder="Jo Sparks" />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@yourcompany.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </FormControl>
              <FormMessage>At least 8 characters.</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Type it again"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" loading={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}

export function RegisterFooter() {
  return (
    <p className="mt-6 text-center text-sm text-ink-60">
      Already have an account?{" "}
      <Link
        href="/login"
        className="font-medium text-brand underline-offset-4 hover:underline"
      >
        Sign in
      </Link>
    </p>
  );
}
