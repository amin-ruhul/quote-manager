/**
 * The mark: a bolt cut from a rounded blue tile. Drawn rather than an image
 * file so it stays crisp, weighs nothing, and inherits the brand blue.
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
        <svg viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="M13.5 2 4 13.2h6.2L9.8 22 20 10.6h-6.4L13.5 2Z"
            fill="#fff"
          />
        </svg>
      </span>
      <span
        className={`text-[17px] font-semibold tracking-[-0.01em] ${labelClassName ?? ""}`}
      >
        QuotePilot
      </span>
    </span>
  );
}
