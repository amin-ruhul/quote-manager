/*
 * The QuotePace mark, in one place.
 *
 * The bolt is drawn from a path rather than the ⚡ emoji so every rendering of
 * it — favicon, home-screen icon, maskable icon — is the same shape. (Emoji
 * would also make icon generation depend on whichever font the renderer
 * happens to have.) Colours mirror DESIGN.md; they are duplicated here because
 * these icons are rasterised outside the browser, where CSS variables do not
 * exist.
 */

/** Lightning bolt on a 24x24 grid. Bounding box: x 3–21, y 2–22. */
export const BRAND_MARK_PATH = "M13 2 L3 14 h9 l-1 8 10-12 h-9 l1-8 z";

export const BRAND_MARK_VIEWBOX = 24;

/** --brand / --canvas from DESIGN.md. */
export const BRAND_BLUE = "#0075DE";
export const BRAND_CANVAS = "#F6F5F4";
