"use client";

import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

/**
 * A labelled on/off row inside a React Hook Form field.
 *
 * The value is carried as the strings "true"/"false" rather than a boolean,
 * because the form submits through FormData and everything there is a string.
 * The hidden input is what actually submits: an unchecked switch sends nothing
 * at all, so without it "off" and "never rendered" would be indistinguishable
 * on the server.
 */
export function SwitchField({
  name,
  value,
  onChange,
  label,
  hint,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
}) {
  return (
    <FormItem className="flex items-center justify-between gap-4 space-y-0">
      <div className="min-w-0">
        <FormLabel>{label}</FormLabel>
        {hint ? <p className="mt-0.5 text-sm text-ink-60">{hint}</p> : null}
      </div>

      <input type="hidden" name={name} value={value} />
      <FormControl>
        <Switch
          checked={value === "true"}
          onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
        />
      </FormControl>
    </FormItem>
  );
}
