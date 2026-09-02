import { ImageResponse } from "next/og";

import { BRAND_BLUE, BRAND_MARK_PATH } from "@/lib/brand";

// Favicon, generated so there's no binary asset to keep in sync with the brand.
// Same mark as the home-screen icons in public/icons/ (see lib/brand.ts).
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
        background: BRAND_BLUE,
        borderRadius: 7,
      }}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="#fff">
        <path d={BRAND_MARK_PATH} />
      </svg>
    </div>,
    size,
  );
}
