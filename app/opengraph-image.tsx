import { ImageResponse } from "next/og";

/*
 * The picture that shows up when the link is pasted into a text or a Facebook
 * group. Headline plus the price, on the brand's warm paper — the two things
 * that make an electrician stop scrolling.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "QuotePace — send the quote before you leave the driveway";

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
            background: "#0075DE",
            borderRadius: 10,
            color: "#fff",
            fontSize: 30,
          }}
        >
          ⚡
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#000" }}>
          QuotePace
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "rgba(0,0,0,0.9)",
          maxWidth: 900,
        }}
      >
        Send the quote before you leave the driveway.
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            background: "#E4F4EB",
            color: "#0F7A38",
            padding: "12px 22px",
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          Accepted · $4,541.09
        </div>
        <div
          style={{ display: "flex", fontSize: 26, color: "rgba(0,0,0,0.6)" }}
        >
          Quoting software for residential electricians
        </div>
      </div>
    </div>,
    size,
  );
}
