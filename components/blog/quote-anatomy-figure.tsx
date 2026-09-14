/*
 * What belongs on a professional electrical quote, grouped so a reader can
 * scan it. A table of twelve undifferentiated rows would be accurate and
 * unread; three groups answer the customer's actual question: who is this,
 * what am I paying for, and what happens if something changes.
 */

const GROUPS = [
  {
    heading: "Who and where",
    items: [
      "Your business name and contact details",
      "Customer name and the job address",
      "Quote number and the date you sent it",
    ],
  },
  {
    heading: "What they are paying for",
    items: [
      "The scope, in plain language",
      "Line items with quantities",
      "Labor and materials, shown separately",
      "Tax, permit, and inspection costs where they apply",
    ],
  },
  {
    heading: "The edges",
    items: [
      "Exclusions and assumptions",
      "How long the price holds",
      "Payment terms",
      "A place for the customer to accept",
    ],
  },
];

export function QuoteAnatomyFigure() {
  return (
    <figure className="rounded-card my-10 border border-black/8 bg-surface p-6">
      <figcaption className="text-sm text-ink-60">
        If they can answer &ldquo;what exactly am I paying for?&rdquo;, the
        quote is doing its job.
      </figcaption>

      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="text-xs font-medium tracking-[0.08em] text-ink-60 uppercase">
              {group.heading}
            </p>
            <ul className="mt-3 list-none space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-pretty text-ink-90"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </figure>
  );
}
