import { ImageResponse } from "next/og";
import { bestOddsForTip, getMatchById, getTeamByCode } from "@/lib/data";
import { getMergedTipBySlug, getMergedTipsterBySlug } from "@/lib/merged-data";
import { SITE_NAME } from "@/lib/site";

export const alt = "Tip preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "linear-gradient(135deg, #022c22 0%, #047857 60%, #065f46 100%)";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tip = await getMergedTipBySlug(slug);
  const match = tip ? getMatchById(tip.matchId) : undefined;
  const tipster = tip ? await getMergedTipsterBySlug(tip.tipsterSlug) : undefined;
  const home = match ? getTeamByCode(match.homeCode) : undefined;
  const away = match ? getTeamByCode(match.awayCode) : undefined;

  if (!tip || !match || !tipster || !home || !away) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {SITE_NAME}
        </div>
      ),
      { ...size },
    );
  }

  const best = bestOddsForTip(tip);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          color: "#fffbeb",
          background: BG,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#a7f3d0",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: "linear-gradient(135deg, #064e3b, #022c22)",
                color: "#fde68a",
                fontWeight: 800,
                fontSize: 32,
              }}
            >
              T
            </div>
            <span style={{ color: "#ffffff", fontSize: 32 }}>{SITE_NAME}</span>
          </div>
          <span>Group {match.group} · {tip.market}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            marginTop: "40px",
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em" }}>{home.code}</div>
            <div style={{ fontSize: 24, color: "#a7f3d0" }}>{home.name}</div>
          </div>
          <div style={{ fontSize: 48, color: "#fde68a", fontWeight: 700 }}>vs</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em" }}>{away.code}</div>
            <div style={{ fontSize: 24, color: "#a7f3d0" }}>{away.name}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(167,243,208,0.25)",
            borderRadius: 24,
            padding: "32px 40px",
          }}
        >
          <div style={{ fontSize: 22, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            Tip
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#ffffff", maxWidth: "70%" }}>
              {tip.prediction}
            </div>
            <div style={{ fontSize: 64, fontWeight: 800, color: "#fde68a" }}>
              {best.value.toFixed(2)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#a7f3d0",
            paddingTop: "32px",
          }}
        >
          <span>By {tipster.name}</span>
          <span>Best @ {best.bookmaker.name}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
