import { bestOddsForTip, getBookmakerBySlug, type Tip } from "@/lib/data";
import BookmakerLogo from "@/components/BookmakerLogo";

export default function BookmakerOddsTable({ tip }: { tip: Tip }) {
  const best = bestOddsForTip(tip);

  // Sort highest odds first so the comparison reads top-down.
  const sorted = [...tip.odds].sort((a, b) => b.value - a.value);

  return (
    <table className="odds-table">
      <thead>
        <tr>
          <th>Bookmaker</th>
          <th>Country</th>
          <th style={{ textAlign: "right" }}>Odds</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((offer) => {
          const bm = getBookmakerBySlug(offer.bookmaker);
          if (!bm) return null;
          const isBest = offer.value === best.value && offer.bookmaker === best.bookmaker.slug;
          return (
            <tr key={offer.bookmaker} className={isBest ? "odds-row--best" : undefined}>
              <td>
                <span className="odds-bookmaker">
                  <BookmakerLogo bookmaker={bm} />
                  {bm.name}
                  {isBest ? <span className="odds-best-tag">Best</span> : null}
                </span>
              </td>
              <td>{bm.country}</td>
              <td style={{ textAlign: "right" }}>
                <span className="odds-value">{offer.value.toFixed(2)}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
