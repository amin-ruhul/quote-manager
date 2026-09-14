import { ImageResponse } from "next/og";

import { BRAND_BLUE, BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from "@/lib/brand";
import { getPost } from "@/lib/blog";

/*
 * The picture for this post when the link is pasted into a trade Facebook
 * group or a text. The numbered steps are the post's argument in miniature:
 * this is a process, not another “what should I charge” cost guide.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const post = getPost("how-to-quote-electrical-work")!;
export const alt = post.title;

const STEPS = ["Scope", "Labor", "Materials", "Margin", "Send"];

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
          maxWidth: 980,
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
        <div style={{ display: "flex", gap: 10 }}>
          {STEPS.map((step, index) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: index === STEPS.length - 1 ? BRAND_BLUE : "#fff",
                color: index === STEPS.length - 1 ? "#fff" : "rgba(0,0,0,0.8)",
                borderRadius: 8,
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {String(index + 1).padStart(2, "0")} {step}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 26, color: "rgba(0,0,0,0.6)" }}>
        A process you can run from the van.
      </div>
    </div>,
    size,
  );
}
