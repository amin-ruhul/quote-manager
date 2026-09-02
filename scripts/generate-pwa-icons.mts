/*
 * Generates the home-screen icons from the shared brand mark.
 *
 * Run by hand after the mark changes, not during the build — the PNGs are
 * committed so a deploy never depends on a rasteriser:
 *
 *   npm run icons:generate
 *
 * A manifest icon has to be a real PNG: iOS ignores SVG for apple-touch-icon,
 * and Android's maskable support is only dependable with raster.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { BRAND_BLUE, BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/lib/brand";

/** Icons the manifest points at by URL. */
const PUBLIC_ICONS = path.join(process.cwd(), "public", "icons");
/*
 * The apple-touch-icon instead lives in app/ under Next's `apple-icon` file
 * convention, which emits the <link> and the cache-busting hash for us. Setting
 * metadata.icons by hand would replace the generated favicon link too.
 */
const APP_DIR = path.join(process.cwd(), "app");

type IconSpec = {
  dir: string;
  file: string;
  size: number;
  /** How much of the icon the 24x24 mark grid spans. */
  markScale: number;
  label: string;
};

/*
 * `maskable` keeps the mark inside Android's safe zone — a circle 80% of the
 * icon's width — because the launcher is free to crop anything outside it.
 * The others are full-bleed, which is what iOS and the manifest's "any"
 * purpose expect.
 */
const ICONS: IconSpec[] = [
  {
    dir: PUBLIC_ICONS,
    file: "icon-192.png",
    size: 192,
    markScale: 0.7,
    label: "manifest 192",
  },
  {
    dir: PUBLIC_ICONS,
    file: "icon-512.png",
    size: 512,
    markScale: 0.7,
    label: "manifest 512",
  },
  {
    dir: PUBLIC_ICONS,
    file: "icon-maskable-512.png",
    size: 512,
    markScale: 0.6,
    label: "maskable 512",
  },
  {
    dir: APP_DIR,
    file: "apple-icon.png",
    size: 180,
    markScale: 0.66,
    label: "apple touch 180",
  },
];

function iconSvg({ size, markScale }: IconSpec): string {
  const grid = size * markScale;
  const offset = (size - grid) / 2;
  const scale = grid / BRAND_MARK_VIEWBOX;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND_BLUE}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${BRAND_MARK_PATH}" fill="#FFFFFF"/>
  </g>
</svg>`;
}

async function main() {
  await mkdir(PUBLIC_ICONS, { recursive: true });

  for (const spec of ICONS) {
    const png = await sharp(Buffer.from(iconSvg(spec)))
      // Home-screen icons must be opaque: iOS composites transparency onto
      // black, which would put a dark ring around the mark.
      .flatten({ background: BRAND_BLUE })
      .png()
      .toBuffer();

    const target = path.join(spec.dir, spec.file);
    await writeFile(target, png);
    process.stdout.write(
      `  ${path.relative(process.cwd(), target).padEnd(34)} ${spec.label}\n`,
    );
  }

  process.stdout.write(`\nWrote ${ICONS.length} icons.\n`);
}

await main();
