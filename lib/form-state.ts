/**
 * What every form's server action returns. `error` is the banner for problems
 * that belong to no single field (a failed write, a bad password); `fieldErrors`
 * is keyed by input name and rendered under that input.
 */
export type ActionState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

/**
 * Collapses Zod issues into one message per field, which is what the forms
 * render under each input. First issue wins — showing three messages on one
 * input is noise, not help.
 */
export function toFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
