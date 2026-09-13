"use client";

import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps, Variants } from "motion/react";
import { createContext, useContext } from "react";

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
 * **`onMount` animates in CSS, not here.** A JavaScript reveal has to
 * server-render its hidden state as an inline `opacity: 0`, which means the
 * content is invisible until React hydrates. That is survivable for a section
 * you have to scroll to reach — the bundle has landed by then — and not
 * survivable for the first screen, where it shipped a blank page to anyone
 * whose JavaScript was slow. Those wrappers now render as plain elements
 * carrying `.reveal-rise` / `.reveal-stagger` from `globals.css`, so they are
 * visible at first paint and animate without a bundle.
 *
 * The scroll-triggered wrappers still carry `data-reveal` and still
 * server-render hidden; `globals.css` overrides `[data-reveal]` inside
 * `<noscript>` so a visitor without JavaScript sees them too.
 */

/** Distance the element travels on its way in, in pixels. */
const LIFT = 16;

/** Seconds between siblings inside a RevealGroup. */
const STAGGER = 0.07;

/**
 * True inside a group that animates in CSS, so `RevealItem` knows to render a
 * plain element and let `.reveal-stagger > *` time its entrance. Without this
 * the item would re-introduce the inline `opacity: 0` its parent just avoided.
 */
const CssRevealGroup = createContext(false);

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

  // The casts undo what HTMLMotionProps widens: motion allows a MotionValue
  // where the DOM only takes a plain value. Nothing here passes one — these
  // wrappers are handed a className and children — so narrowing back to the
  // React types is safe, and is what the plain element being rendered needs.
  if (onMount) {
    const { className, style, ...rest } = props;
    const base = style as React.CSSProperties | undefined;
    return (
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        className={`reveal-rise ${className ?? ""}`}
        style={delay ? { animationDelay: `${delay}s`, ...base } : base}
      >
        {children as React.ReactNode}
      </div>
    );
  }

  const hidden = reduced ? { opacity: 1 } : { opacity: 0, y: LIFT };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.div
      data-reveal
      initial={hidden}
      whileInView={shown}
      /*
       * `once` matters here: re-firing on every scroll past turns a long
       * marketing page into a flicker gallery.
       *
       * `amount: "some"` matters more. A fractional threshold asks for 20% of
       * the element to be showing, and a flick-scroll routinely lands with a
       * tall section only partly on screen — under the threshold, so it never
       * fires, and `once` means it never gets a second chance. The section just
       * stays blank. Any visible pixel is the only threshold that cannot strand
       * content.
       */
      viewport={{ once: true, amount: "some", margin: "0px 0px -80px 0px" }}
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

  if (onMount) {
    const { className, ...rest } = props;
    return (
      <CssRevealGroup value>
        <div
          {...(rest as React.HTMLAttributes<HTMLDivElement>)}
          className={`reveal-stagger ${className ?? ""}`}
        >
          {children as React.ReactNode}
        </div>
      </CssRevealGroup>
    );
  }

  return (
    <motion.div
      data-reveal
      initial="hidden"
      whileInView="shown"
      // "some" rather than a fraction, for the reason given in `Reveal`.
      viewport={{ once: true, amount: "some", margin: "0px 0px -80px 0px" }}
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
  const inCssGroup = useContext(CssRevealGroup);

  // Inside a CSS group the entrance belongs to `.reveal-stagger > *`, so this
  // renders as an ordinary element — no variants, and no inline opacity.
  if (inCssGroup) {
    const { as = "div", ...rest } = props;
    return as === "li" ? (
      <li {...(rest as React.LiHTMLAttributes<HTMLLIElement>)} />
    ) : (
      <div {...(rest as React.HTMLAttributes<HTMLDivElement>)} />
    );
  }

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
