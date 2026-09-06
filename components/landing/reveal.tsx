"use client";

import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps, Variants } from "motion/react";

/**
 * The landing page's entire motion vocabulary, in one file.
 *
 * Every animated section imports `Reveal` (and `RevealGroup` when children
 * should stagger) rather than defining its own variants, so the page has one
 * timing curve instead of nine. DESIGN.md puts motion at ~200ms ease and saves
 * springiness for tiny marks — this is a pro tool, so the reveal is a short
 * fade with a small lift, nothing that bounces.
 *
 * `useReducedMotion` collapses both the offset and the duration to zero, which
 * leaves the content rendered and static rather than hidden.
 *
 * Every wrapper carries `data-reveal`. The hidden state is server-rendered as
 * an inline `opacity: 0`, so without it a visitor whose JavaScript never
 * arrives — blocked, failed chunk, dead signal in a basement — would get a
 * blank page. `globals.css` overrides `[data-reveal]` inside `<noscript>`, and
 * `app/page.tsx` renders that noscript block.
 */

/** Distance the element travels on its way in, in pixels. */
const LIFT = 16;

/** Seconds between siblings inside a RevealGroup. */
const STAGGER = 0.07;

type RevealProps = HTMLMotionProps<"div"> & {
  /** Seconds to wait before this element starts. Ignored inside a RevealGroup. */
  delay?: number;
  /**
   * Animate as soon as the component mounts instead of on scroll. Used above
   * the fold, where waiting for an intersection would show a blank hero.
   */
  onMount?: boolean;
};

export function Reveal({
  delay = 0,
  onMount = false,
  children,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();

  const hidden = reduced ? { opacity: 1 } : { opacity: 0, y: LIFT };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.div
      data-reveal
      initial={hidden}
      {...(onMount
        ? { animate: shown }
        : {
            whileInView: shown,
            // `once` matters here: re-firing on every scroll past turns a
            // long marketing page into a flicker gallery.
            viewport: { once: true, amount: 0.2, margin: "0px 0px -80px 0px" },
          })}
      transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggers its direct `Reveal` children. Children must not set their own
 * `delay` — the group owns the timing.
 */
export function RevealGroup({
  onMount = false,
  children,
  ...props
}: HTMLMotionProps<"div"> & { onMount?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      data-reveal
      initial="hidden"
      {...(onMount
        ? { animate: "shown" }
        : {
            whileInView: "shown",
            viewport: { once: true, amount: 0.15, margin: "0px 0px -80px 0px" },
          })}
      variants={{
        shown: {
          transition: { staggerChildren: reduced ? 0 : STAGGER },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * A child of `RevealGroup`. Takes its timing from the group.
 *
 * `as` exists because the steps and features are real `<ol>`/`<ul>` lists: an
 * animated wrapper `<div>` between the list and its items would break that
 * semantic, so the item animates as the `<li>` itself.
 */
type RevealItemProps =
  | ({ as?: "div" } & HTMLMotionProps<"div">)
  | ({ as: "li" } & HTMLMotionProps<"li">);

export function RevealItem(props: RevealItemProps) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: LIFT },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.4, ease: "easeOut" },
    },
  };

  // Branching rather than a lookup table: div and li have different event
  // handler types, so the two elements cannot share one props type. The casts
  // re-narrow what destructuring the union widened — `as` has already decided
  // which branch we are in, so each cast matches the element being rendered.
  const { as = "div", ...rest } = props;

  if (as === "li") {
    return (
      <motion.li
        data-reveal
        variants={variants}
        {...(rest as HTMLMotionProps<"li">)}
      />
    );
  }

  return (
    <motion.div
      data-reveal
      variants={variants}
      {...(rest as HTMLMotionProps<"div">)}
    />
  );
}
