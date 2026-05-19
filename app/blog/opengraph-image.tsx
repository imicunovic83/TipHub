import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} blog`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "#fffbeb",
          background: "linear-gradient(135deg, #022c22 0%, #047857 60%, #065f46 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "linear-gradient(135deg, #064e3b, #022c22)",
              color: "#fde68a",
              fontWeight: 800,
              fontSize: 50,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 32, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            Blog
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, color: "#ffffff" }}>
            Match previews & editorial
          </div>
          <div style={{ fontSize: 30, color: "#a7f3d0", lineHeight: 1.3 }}>
            Long-form breakdowns from the TipHub community.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#a7f3d0",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <span>★ Updated weekly</span>
          <span>tiphub.rs/blog</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
