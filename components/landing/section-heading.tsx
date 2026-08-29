/** Shared eyebrow + title, so every section starts the same way. */
export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium tracking-[0.08em] text-ink-40 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-lg text-pretty text-body">{body}</p>
      ) : null}
    </div>
  );
}
