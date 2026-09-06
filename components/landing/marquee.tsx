/**
 * The strip that crosses the page under the hero.
 *
 * The reference this is modelled on runs two counter-rotating blue bars. Two
 * would put a second large chromatic field on the same screen as the hero's
 * blue button, so this is one bar in `midnight` — the sanctioned dark island
 * (DESIGN.md accent cast) — tilted just enough to read as deliberate.
 *
 * Every phrase is something the product actually does. A marquee of adjectives
 * would be decoration; this one is a capability list that happens to move.
 */
const PHRASES = [
  "Panel upgrade quoted in 4 minutes",
  "Priced from your own pricebook",
  "Sent before you leave the driveway",
  "Opened — you get the email",
  "Accepted on their phone",
  "Signed, no app, no login",
  "Follow-up sent for you",
];

export function Marquee() {
  return (
    <div
      /*
       * The vertical padding is not decoration: rotating a full-width bar
       * pushes its corners past the box that clips it, so without room to
       * overhang the tilt shears the first and last words off. The negative
       * top margin then pulls the whole thing back up under the hero.
       */
      className="relative -mt-10 overflow-hidden py-6 sm:-mt-12 sm:py-8"
      // The strip is decoration wrapping real phrases; the same claims are made
      // in prose elsewhere on the page, so screen readers lose nothing here.
      aria-hidden
    >
      <div className="scale-x-110 -rotate-2 bg-midnight py-3">
        {/* Two identical tracks: the animation translates by exactly -50%,
            so the second lines up where the first began. */}
        <div className="marquee-track flex w-max">
          <Track />
          <Track />
        </div>
      </div>
    </div>
  );
}

function Track() {
  return (
    <ul className="flex shrink-0 items-center">
      {PHRASES.map((phrase) => (
        <li
          key={phrase}
          className="flex items-center gap-6 px-6 text-sm font-medium whitespace-nowrap text-white/90"
        >
          {phrase}
          <span className="size-1 rounded-pill bg-marigold" />
        </li>
      ))}
    </ul>
  );
}
