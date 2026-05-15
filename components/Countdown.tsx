import { daysUntilKickoff } from "@/lib/data";

// Reference date used so static rendering produces stable output and the
// countdown stays consistent across pages.
const REFERENCE_DATE = "2026-05-15T00:00:00Z";

export default function Countdown({ kickoffISO }: { kickoffISO: string }) {
  const days = daysUntilKickoff(kickoffISO, REFERENCE_DATE);
  const variant = days <= 0 ? "live" : days <= 7 ? "soon" : "later";
  const className =
    variant === "live" ? "tip-countdown tip-countdown--live"
    : variant === "soon" ? "tip-countdown tip-countdown--soon"
    : "tip-countdown";

  const label =
    variant === "live" ? "Live / done"
    : days === 1 ? "Starts in 1 day"
    : `Starts in ${days} days`;

  return <span className={className}>{label}</span>;
}
