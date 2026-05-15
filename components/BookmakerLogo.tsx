import type { Bookmaker } from "@/lib/data";

// Brand-coloured rounded square with the bookmaker's short code, used in
// place of a real logo so the demo doesn't ship trademarked image assets.

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
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: bookmaker.brandColor,
        color: "#ffffff",
        fontSize: Math.round(size * 0.4),
      }}
    >
      {bookmaker.shortCode}
    </span>
  );
}
