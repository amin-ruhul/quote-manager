"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/*
 * A dropdown that can't dead-end. The owner picks from a list we suggest, from
 * the values they've already used, or adds their own — and the one they add is
 * saved with the row, so it's simply there in the list next time.
 *
 * This replaced an <input list="..."> datalist, which looked like a dropdown and
 * behaved like nothing: Chrome only opens a datalist once you start typing, so
 * on an empty pricebook the field appeared broken.
 *
 * The value always reaches FormData through one hidden input, so the server
 * action reads the same field name in either mode and neither sentinel below can
 * be mistaken for a real category or unit.
 */

const ADD_YOUR_OWN = "__add__";
const NOTHING_CHOSEN = "__none__";

function unique(values: (string | null | undefined)[]): string[] {
  return [
    ...new Set(values.filter((v): v is string => !!v && v.trim() !== "")),
  ];
}

export function SelectOrAdd({
  name,
  value,
  onChange,
  suggestions,
  used,
  placeholder,
  addLabel,
  emptyLabel,
  inputPlaceholder,
  ...props
}: {
  name: string;
  /** "" means nothing chosen, which only `emptyLabel` fields allow. */
  value: string;
  onChange: (value: string) => void;
  /** What we offer out of the box. */
  suggestions: readonly string[];
  /** Values this business already uses, so their own vocabulary comes back. */
  used: string[];
  placeholder?: string;
  addLabel: string;
  /** Provide only when the field is optional; omitting it hides the "none" row. */
  emptyLabel?: string;
  inputPlaceholder?: string;
  /*
   * What <FormControl> clones onto its child. Forwarded to whichever control is
   * on screen, so the label, the error text and the red ring all stay wired up
   * in add mode exactly as they are in select mode.
   */
} & Pick<
  React.ComponentProps<"input">,
  "id" | "aria-describedby" | "aria-invalid"
>) {
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // What the list showed before "Add your own", so Cancel can put it back.
  const previous = useRef(value);

  /*
   * A value already on the row always appears, even if it is neither suggested
   * nor used elsewhere — otherwise editing an item would silently blank a unit
   * the owner typed once. Their own values come first: those are the ones they
   * actually reach for.
   */
  const theirs = unique([...used, value]).filter(
    (option) => !suggestions.includes(option),
  );

  function startAdding() {
    previous.current = value;
    setIsAdding(true);
    onChange("");
    // The list is unmounting as this runs, so focus waits for the input to exist.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function stopAdding() {
    setIsAdding(false);
    onChange(previous.current);
  }

  if (isAdding) {
    return (
      <div className="flex gap-2">
        {/* Not `name`d: the hidden input below is the single field that submits. */}
        <Input
          {...props}
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={inputPlaceholder}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              stopAdding();
            }
          }}
        />
        <input type="hidden" name={name} value={value} />
        {/* No "confirm": what's typed is already the field's value, and the
            form's own Save is the only commit. This just backs out. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={stopAdding}
          aria-label="Cancel and go back to the list"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value === "" ? NOTHING_CHOSEN : value}
        onValueChange={(next) => {
          if (next === ADD_YOUR_OWN) startAdding();
          else onChange(next === NOTHING_CHOSEN ? "" : next);
        }}
      >
        <SelectTrigger {...props} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {emptyLabel ? (
            <SelectGroup>
              <SelectItem value={NOTHING_CHOSEN}>{emptyLabel}</SelectItem>
            </SelectGroup>
          ) : null}

          {theirs.length > 0 ? (
            <SelectGroup>
              <SelectLabel>Yours</SelectLabel>
              {theirs.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null}

          <SelectGroup>
            {theirs.length > 0 ? <SelectLabel>Suggested</SelectLabel> : null}
            {suggestions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            {/* Inside the group, so its -mx-1 lands on the group's own p-1. */}
            <SelectSeparator />
            <SelectItem value={ADD_YOUR_OWN}>
              <Plus />
              {addLabel}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
