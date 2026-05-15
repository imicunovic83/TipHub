import Link from "next/link";
import {
  bestOddsForTip,
  getMatchById,
  getTeamByCode,
  getTipsByMatch,
  getTipsterBySlug,
  type Tip,
} from "@/lib/data";
import { Badge } from "@/components/Badge";
import ConfidenceStars from "@/components/ConfidenceStars";
import Countdown from "@/components/Countdown";
import Flag from "@/components/Flag";
import BookmakerLogo from "@/components/BookmakerLogo";
import FavoriteButton from "@/components/FavoriteButton";

const MARKET_VARIANT = {
  "1X2": "pitch",
  "Over/Under 2.5": "gold",
  BTTS: "blue",
  "Asian Handicap": "rose",
  "Correct Score": "violet",
} as const;

export default function TipCard({ tip }: { tip: Tip }) {
  const match = getMatchById(tip.matchId);
  const tipster = getTipsterBySlug(tip.tipsterSlug);
  if (!match || !tipster) return null;

  const home = getTeamByCode(match.homeCode);
  const away = getTeamByCode(match.awayCode);
  if (!home || !away) return null;

  const best = bestOddsForTip(tip);
  const variant = MARKET_VARIANT[tip.market];

  const confidenceClass =
    tip.confidence >= 5 ? "card-link card-link--confidence-high"
    : tip.confidence >= 3 ? "card-link card-link--confidence-mid"
    : "card-link card-link--confidence-low";

  // Consensus = how many other tipsters have a tip on this same match.
  const consensusCount = getTipsByMatch(match.id).length - 1;

  return (
    <Link href={`/tips/${tip.slug}`} className={confidenceClass}>
      <FavoriteButton tipId={tip.id} />

      <div className="badge-row" style={{ paddingRight: "2rem" }}>
        <span className="group-chip" aria-label={`Group ${match.group}`}>{match.group}</span>
        <Badge variant={variant}>{tip.market}</Badge>
        {tip.isPremium ? <Badge variant="gold">Premium</Badge> : null}
        {consensusCount > 0 ? (
          <span className="consensus-chip" title={`${consensusCount} other tipster${consensusCount === 1 ? "" : "s"} on this match`}>
            👥 +{consensusCount} more
          </span>
        ) : null}
      </div>

      <div className="tip-match">
        <span className="tip-match-team">
          <Flag code={home.flag} alt={home.name} width={22} />
          <span className="team-code">{home.code}</span>
          {home.name}
        </span>
        <span className="tip-match-vs">vs</span>
        <span className="tip-match-team tip-match-team--away">
          {away.name}
          <span className="team-code">{away.code}</span>
          <Flag code={away.flag} alt={away.name} width={22} />
        </span>
      </div>

      <div className="tip-prediction">
        <div>
          <div className="tip-prediction-label">Tip</div>
          <div className="tip-prediction-value">{tip.prediction}</div>
        </div>
        <div className="tip-prediction-odds">{best.value.toFixed(2)}</div>
      </div>

      <p className="card-link-body">{tip.shortReason}</p>

      <div className="tip-meta-row">
        <span className="tip-best-bookmaker">
          <BookmakerLogo bookmaker={best.bookmaker} size={18} />
          Best @ <strong>{best.bookmaker.name}</strong>
        </span>
        <ConfidenceStars value={tip.confidence} />
      </div>

      <div className="card-footer">
        <span>By {tipster.name}</span>
        <Countdown kickoffISO={match.kickoffISO} />
      </div>
    </Link>
  );
}
