import { ImageResponse } from "next/og";

import { BRAND_BLUE, BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/lib/brand";
import { getPost } from "@/lib/blog";

/*
 * The picture for this post when the link is pasted into a trade Facebook
 * group or a text — which, for this audience, is most of how it will travel.
 * The stacked bar is the post's figure in miniature: enough to signal "this is
 * a breakdown, not another cost guide" at thumbnail size.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const post = getPost("what-to-charge-200a-panel-upgrade")!;
export const alt = post.title;

/** The same five shares as the in-post figure, as [width %, color]. */
const BANDS: [number, string][] = [
  [27.5, "#62AEF0"],
  [35.9, BRAND_BLUE],
  [5.6, "#FFB110"],
  [17.2, "#B18164"],
  [13.8, "#02093A"],
];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#F6F5F4",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BRAND_BLUE,
            borderRadius: 10,
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox={`0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}`}
          >
            <path d={BRAND_MARK_PATH} fill="#fff" />
          </svg>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#000" }}>
          QuotePace
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          maxWidth: 940,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "rgba(0,0,0,0.9)",
          }}
        >
          {post.title}
        </div>
        <div style={{ display: "flex", width: 940, height: 22, gap: 3 }}>
          {BANDS.map(([width, color]) => (
            <div
              key={color}
              style={{ width: `${width}%`, height: "100%", background: color }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 26, color: "rgba(0,0,0,0.6)" }}>
        Build it from your own costs — not a national average.
      </div>
    </div>,
    size,
  );
}
