/**
 * Shared eyebrow + title, so every section starts the same way.
 *
 * The eyebrow renders as a brand-wash pill — small, quiet, and the one place
 * per section where the blue appears without competing with the page's single
 * filled button (DESIGN.md: colour lives in pills and card backgrounds).
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  /** Centered openings give the page OnMock's rhythm; `start` stays left-aligned. */
  align?: "start" | "center";
}) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="inline-flex rounded-pill bg-brand-wash px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-brand uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-4 text-lg text-pretty text-body ${centered ? "mx-auto" : ""}`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
