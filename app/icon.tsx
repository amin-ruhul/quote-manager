import { ImageResponse } from "next/og";

// Favicon, generated so there's no binary asset to keep in sync with the brand.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0075DE",
        borderRadius: 7,
        color: "#fff",
        fontSize: 22,
        fontWeight: 700,
      }}
    >
      ⚡
    </div>,
    size,
  );
}
