"use client";

import Link from "next/link";

import { signIn } from "@/app/login/actions";
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
import type { ActionState } from "@/lib/form-state";
import { signInSchema } from "@/lib/schemas/auth";
import { useActionForm } from "@/lib/use-action-form";

const initialState: ActionState = { error: null, fieldErrors: {} };

export function LoginForm({ next }: { next: string }) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: signInSchema,
    defaultValues: { email: "", password: "", next },
    initialState,
    action: signIn,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />

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
                  autoComplete="current-password"
                  placeholder="Your password"
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
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}

/**
 * Outside the form so it is not swallowed by the card's rhythm — the way off
 * this page needs to be obvious to someone who came here by mistake.
 */
export function LoginFooter() {
  return (
    <p className="mt-6 text-center text-sm text-ink-60">
      New to QuotePilot?{" "}
      <Link
        href="/register"
        className="font-medium text-brand underline-offset-4 hover:underline"
      >
        Create an account
      </Link>
    </p>
  );
}
