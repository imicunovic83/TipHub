import Link from "next/link";
import {
  bestOddsForTip,
  getMatchById,
  getTeamByCode,
  getTipsterBySlug,
  type Tip,
} from "@/lib/data";
import { Badge } from "@/components/Badge";
import ConfidenceStars from "@/components/ConfidenceStars";
import Countdown from "@/components/Countdown";

const MARKET_VARIANT = {
  "1X2": "pitch",
  "Over/Under 2.5": "gold",
  BTTS: "pitch",
  "Asian Handicap": "rose",
  "Correct Score": "solid",
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

  return (
    <Link href={`/tips/${tip.slug}`} className="card-link">
      <div className="badge-row">
        <span className="group-chip" aria-label={`Group ${match.group}`}>{match.group}</span>
        <Badge variant={variant}>{tip.market}</Badge>
        {tip.isPremium ? <Badge variant="gold">Premium</Badge> : null}
      </div>

      <div className="tip-match">
        <span className="tip-match-team">
          <span className="tip-match-team-flag">{home.flag}</span>
          {home.name}
        </span>
        <span className="tip-match-vs">vs</span>
        <span className="tip-match-team tip-match-team--away">
          {away.name}
          <span className="tip-match-team-flag">{away.flag}</span>
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
