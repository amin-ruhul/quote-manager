/*
 * The QuotePace mark, in one place.
 *
 * A quotation mark set in italic: the quote we write, at pace. It replaced a
 * lightning bolt, which was the wrong idea twice over — every trade brand uses
 * one, and it tied our identity to electricians when the engine is meant to
 * take plumbers and HVAC next (SPEC §15).
 *
 * Drawn from a path rather than an image or the ” glyph so every rendering of
 * it — favicon, home-screen icon, maskable icon — is the same shape, and so
 * icon generation does not depend on whichever font the renderer happens to
 * have. Colours mirror DESIGN.md; they are duplicated here because these icons
 * are rasterised outside the browser, where CSS variables do not exist.
 */

/*
 * Two strokes, leaning right, as filled capsule outlines rather than stroked
 * lines: every consumer paints this with `fill`, and a stroked path would come
 * out hollow in the rasteriser. Each subpath is a 3.4-wide stroke from
 * (10,8)→(6.2,16) and (17.8,8)→(14,16) with round caps, converted to outline.
 * Centred on the 24x24 grid — bounding box x 4.5–19.5, y 6.3–17.7 — so the
 * icon generator, which centres the grid, does not sit it high in the tile.
 */
export const BRAND_MARK_PATH =
  "M8.464 7.271L4.664 15.271A1.7 1.7 0 0 0 7.736 16.729L11.536 8.729A1.7 1.7 0 0 0 8.464 7.271Z" +
  "M16.264 7.271L12.464 15.271A1.7 1.7 0 0 0 15.536 16.729L19.336 8.729A1.7 1.7 0 0 0 16.264 7.271Z";

export const BRAND_MARK_VIEWBOX = 24;

/** --brand / --canvas from DESIGN.md. */
export const BRAND_BLUE = "#0075DE";
export const BRAND_CANVAS = "#F6F5F4";
