import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/lib/brand";

/**
 * The mark: an italic quotation mark cut from a rounded blue tile. Drawn rather
 * than an image file so it stays crisp, weighs nothing, and inherits the brand
 * blue. The path comes from lib/brand.ts so this and the generated icons cannot
 * drift apart — they did once, and nobody noticed until the mark changed.
 *
 * `labelClassName` lets a caller hide the wordtext where space is tight — the
 * app's phone nav drops it so the sections themselves get the width.
 */
export function Wordmark({
  className,
  labelClassName,
}: {
  className?: string;
  labelClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-md bg-brand"
      >
        <svg
          viewBox={`0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}`}
          className="size-4"
          fill="none"
        >
          <path d={BRAND_MARK_PATH} fill="#fff" />
        </svg>
      </span>
      <span
        className={`text-[17px] font-semibold tracking-[-0.01em] ${labelClassName ?? ""}`}
      >
        QuotePace
      </span>
    </span>
  );
}
