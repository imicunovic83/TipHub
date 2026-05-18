import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
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
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            T
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: "#ffffff" }}>
            Honest football tips.
          </div>
          <div style={{ fontSize: 36, color: "#a7f3d0", lineHeight: 1.3 }}>
            Transparent track records. Multi-bookmaker odds. Free forever.
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
          <span>★ World Cup 2026 catalog</span>
          <span>5 Serbian bookmakers compared</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
