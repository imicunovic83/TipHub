import type { Bookmaker } from "@/lib/data";

// Renders the operator's actual logo from /public/bookmakers/. Local
// hosting keeps things deterministic across browsers (no CDN/ORB issues).
// The shortCode + brandColor are used as a safe alt/fallback.

export default function BookmakerLogo({
  bookmaker,
  size = 28,
}: {
  bookmaker: Bookmaker;
  size?: number;
}) {
  return (
    <span
      className="odds-bookmaker-logo"
      style={{
        width: size,
        height: size,
        background: "var(--white)",
        boxShadow: "inset 0 0 0 1px var(--slate-200)",
        padding: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bookmaker.logoSrc}
        alt=""
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        loading="lazy"
      />
    </span>
  );
}
