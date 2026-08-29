"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { type AuthState, signIn, signUp } from "@/app/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Working…" : label}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const action = mode === "signIn" ? signIn : signUp;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@yourcompany.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <SubmitButton label={mode === "signIn" ? "Sign in" : "Create account"} />

      <p className="text-center text-sm text-ink-60">
        {mode === "signIn" ? "New to QuotePilot?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          {mode === "signIn" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
