"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

import type { ActionState } from "@/lib/form-state";

/*
 * One way to run a form, used by every form in the app.
 *
 * React Hook Form validates in the browser against the module's Zod schema, so
 * a typo shows up under the input immediately instead of after a round trip —
 * which is the difference that matters on a phone with one bar at a job site.
 * The server action then parses the same schema again: the client check is
 * convenience, the server check is the boundary, and neither trusts the other.
 *
 * Submission still goes through FormData and a server action, so file inputs
 * (the logo) and hidden fields keep working exactly as they did.
 */

type UseActionFormOptions<
  TFields extends FieldValues,
  TParsed,
  TState extends ActionState,
> = {
  schema: z.ZodType<TParsed, TFields>;
  defaultValues: DefaultValues<TFields>;
  initialState: TState;
  action: (state: TState, formData: FormData) => Promise<TState>;
};

export function useActionForm<
  TFields extends FieldValues,
  TParsed,
  TState extends ActionState,
>({
  schema,
  defaultValues,
  initialState,
  action,
}: UseActionFormOptions<TFields, TParsed, TState>) {
  /*
   * React types useActionState in terms of `Awaited<State>`, which TypeScript
   * cannot reduce while State is still a generic — even though ActionState is a
   * plain object and can never be a promise. The two assertions say only that.
   */
  const [state, dispatch, isPending] = useActionState<TState, FormData>(
    action as (state: Awaited<TState>, payload: FormData) => Promise<TState>,
    initialState as Awaited<TState>,
  );

  const form = useForm<TFields, unknown, TParsed>({
    resolver: zodResolver(schema),
    defaultValues,
    // Quiet until the owner submits, then live — so a half-typed email isn't
    // called wrong while it is still being typed.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  /*
   * Anything the server rejected that the browser let through — a duplicate, a
   * rule only the database knows — is put back on the field it belongs to.
   */
  const { setError } = form;
  useEffect(() => {
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      setError(name as Path<TFields>, { type: "server", message });
    }
  }, [state, setError]);

  /*
   * Only runs once the schema is happy. The FormData is read off the <form>
   * that raised the event rather than from the parsed values, so hidden inputs
   * (quoteId, the row id) and the logo file are all carried along untouched.
   */
  const onSubmit = form.handleSubmit((_values, event) => {
    const element = event?.target;
    if (!(element instanceof HTMLFormElement)) return;

    // Submitting from an event handler rather than a form `action` means the
    // transition is ours to open. Without it `isPending` never flips, and every
    // submit button in the app stays enabled while the action runs.
    const formData = new FormData(element);
    startTransition(() => dispatch(formData));
  });

  return { form, onSubmit, state, isPending };
}
