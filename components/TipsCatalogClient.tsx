"use client";

import { useMemo, useState } from "react";
import {
  bestOddsForTip,
  getMatchById,
  getTeamByCode,
  getTipsterBySlug,
  type Bookmaker,
  type GroupCode,
  type Tip,
  type TipMarket,
} from "@/lib/data";
import TipCard from "@/components/TipCard";

type SortKey = "kickoff" | "odds-desc" | "odds-asc" | "confidence" | "tipster-rate";

export default function TipsCatalogClient({
  tips,
  groups,
  markets,
  tipsters,
  bookmakers,
}: {
  tips: Tip[];
  groups: GroupCode[];
  markets: TipMarket[];
  tipsters: { slug: string; name: string; winRate: number }[];
  bookmakers: Bookmaker[];
}) {
  const [query, setQuery] = useState<string>("");
  const [group, setGroup] = useState<GroupCode | "all">("all");
  const [tipster, setTipster] = useState<string>("all");
  const [market, setMarket] = useState<TipMarket | "all">("all");
  const [oddsBucket, setOddsBucket] = useState<string>("all");
  const [bookmaker, setBookmaker] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("kickoff");

  const tipsterRateBySlug = useMemo(() => {
    const map = new Map<string, number>();
    tipsters.forEach((t) => map.set(t.slug, t.winRate));
    return map;
  }, [tipsters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tips.filter((t) => {
      const match = getMatchById(t.matchId);
      if (!match) return false;
      const tipsterObj = getTipsterBySlug(t.tipsterSlug);
      const home = getTeamByCode(match.homeCode);
      const away = getTeamByCode(match.awayCode);

      // Free-text search across multiple fields (this is the "search by more
      // than just title" requirement: team names + tipster + bookmaker name +
      // prediction text + market).
      if (q) {
        const haystack = [
          home?.name,
          away?.name,
          tipsterObj?.name,
          t.prediction,
          t.market,
          t.shortReason,
          ...t.odds.map((o) => bookmakers.find((b) => b.slug === o.bookmaker)?.name ?? ""),
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (group !== "all" && match.group !== group) return false;
      if (tipster !== "all" && t.tipsterSlug !== tipster) return false;
      if (market !== "all" && t.market !== market) return false;

      const best = bestOddsForTip(t);
      if (oddsBucket !== "all") {
        if (oddsBucket === "lt-1.5" && !(best.value < 1.5)) return false;
        if (oddsBucket === "1.5-2.0" && !(best.value >= 1.5 && best.value < 2.0)) return false;
        if (oddsBucket === "2.0-3.0" && !(best.value >= 2.0 && best.value < 3.0)) return false;
        if (oddsBucket === "gt-3.0" && !(best.value >= 3.0)) return false;
      }

      // "Best odds at" filter — only show tips where this bookmaker offers the
      // best price.
      if (bookmaker !== "all" && best.bookmaker.slug !== bookmaker) return false;

      return true;
    });
  }, [tips, query, group, tipster, market, oddsBucket, bookmaker, bookmakers]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const matchA = getMatchById(a.matchId);
      const matchB = getMatchById(b.matchId);
      if (sort === "kickoff") {
        return new Date(matchA?.kickoffISO ?? 0).getTime() - new Date(matchB?.kickoffISO ?? 0).getTime();
      }
      if (sort === "odds-desc") {
        return bestOddsForTip(b).value - bestOddsForTip(a).value;
      }
      if (sort === "odds-asc") {
        return bestOddsForTip(a).value - bestOddsForTip(b).value;
      }
      if (sort === "confidence") {
        return b.confidence - a.confidence;
      }
      if (sort === "tipster-rate") {
        return (tipsterRateBySlug.get(b.tipsterSlug) ?? 0) - (tipsterRateBySlug.get(a.tipsterSlug) ?? 0);
      }
      return 0;
    });
    return copy;
  }, [filtered, sort, tipsterRateBySlug]);

  const isFiltering =
    query !== "" || group !== "all" || tipster !== "all" || market !== "all" ||
    oddsBucket !== "all" || bookmaker !== "all";

  const reset = () => {
    setQuery("");
    setGroup("all");
    setTipster("all");
    setMarket("all");
    setOddsBucket("all");
    setBookmaker("all");
  };

  return (
    <div className="stack-md">
      <div className="panel">
        <div className="grid-filters">
          <div className="field">
            <label htmlFor="tip-search" className="field-label">Search</label>
            <input
              id="tip-search"
              type="text"
              className="input"
              placeholder="Team, tipster, bookmaker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="filter-group" className="field-label">Group</label>
            <select
              id="filter-group"
              className="select"
              value={group}
              onChange={(e) => setGroup(e.target.value as GroupCode | "all")}
            >
              <option value="all">All groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>Group {g}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-tipster" className="field-label">Tipster</label>
            <select
              id="filter-tipster"
              className="select"
              value={tipster}
              onChange={(e) => setTipster(e.target.value)}
            >
              <option value="all">All tipsters</option>
              {tipsters.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-market" className="field-label">Market</label>
            <select
              id="filter-market"
              className="select"
              value={market}
              onChange={(e) => setMarket(e.target.value as TipMarket | "all")}
            >
              <option value="all">All markets</option>
              {markets.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-odds" className="field-label">Odds range</label>
            <select
              id="filter-odds"
              className="select"
              value={oddsBucket}
              onChange={(e) => setOddsBucket(e.target.value)}
            >
              <option value="all">Any odds</option>
              <option value="lt-1.5">Under 1.50</option>
              <option value="1.5-2.0">1.50 – 2.00</option>
              <option value="2.0-3.0">2.00 – 3.00</option>
              <option value="gt-3.0">3.00 and above</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-bookmaker" className="field-label">Best odds at</label>
            <select
              id="filter-bookmaker"
              className="select"
              value={bookmaker}
              onChange={(e) => setBookmaker(e.target.value)}
            >
              <option value="all">Any bookmaker</option>
              {bookmakers.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-sort" className="field-label">Sort by</label>
            <select
              id="filter-sort"
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="kickoff">Kickoff (soonest)</option>
              <option value="odds-desc">Highest odds</option>
              <option value="odds-asc">Lowest odds (safest)</option>
              <option value="confidence">Confidence</option>
              <option value="tipster-rate">Tipster win rate</option>
            </select>
          </div>
        </div>

        {isFiltering ? (
          <div className="filter-chips-row">
            {query ? (
              <span className="filter-chip">
                <strong>Search:</strong> {query}
                <button type="button" className="filter-chip-remove" onClick={() => setQuery("")} aria-label="Clear search">✕</button>
              </span>
            ) : null}
            {group !== "all" ? (
              <span className="filter-chip">
                <strong>Group:</strong> {group}
                <button type="button" className="filter-chip-remove" onClick={() => setGroup("all")} aria-label="Clear group filter">✕</button>
              </span>
            ) : null}
            {tipster !== "all" ? (
              <span className="filter-chip">
                <strong>Tipster:</strong> {tipsters.find((t) => t.slug === tipster)?.name ?? tipster}
                <button type="button" className="filter-chip-remove" onClick={() => setTipster("all")} aria-label="Clear tipster filter">✕</button>
              </span>
            ) : null}
            {market !== "all" ? (
              <span className="filter-chip">
                <strong>Market:</strong> {market}
                <button type="button" className="filter-chip-remove" onClick={() => setMarket("all")} aria-label="Clear market filter">✕</button>
              </span>
            ) : null}
            {oddsBucket !== "all" ? (
              <span className="filter-chip">
                <strong>Odds:</strong> {
                  oddsBucket === "lt-1.5" ? "Under 1.50"
                  : oddsBucket === "1.5-2.0" ? "1.50–2.00"
                  : oddsBucket === "2.0-3.0" ? "2.00–3.00"
                  : oddsBucket === "gt-3.0" ? "3.00+"
                  : oddsBucket
                }
                <button type="button" className="filter-chip-remove" onClick={() => setOddsBucket("all")} aria-label="Clear odds filter">✕</button>
              </span>
            ) : null}
            {bookmaker !== "all" ? (
              <span className="filter-chip">
                <strong>Best @:</strong> {bookmakers.find((b) => b.slug === bookmaker)?.name ?? bookmaker}
                <button type="button" className="filter-chip-remove" onClick={() => setBookmaker("all")} aria-label="Clear bookmaker filter">✕</button>
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="filter-bar">
          <span className="filter-bar-meta">
            Showing <strong>{sorted.length}</strong> of <strong>{tips.length}</strong> tips
          </span>
          {isFiltering ? (
            <button className="btn-link" onClick={reset}>Reset all</button>
          ) : null}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">⚽</div>
          <p className="empty-state-title">No tips match these filters</p>
          <p className="empty-state-body">Try widening the odds range, removing the bookmaker filter, or clearing the search.</p>
          <button className="btn btn-primary" onClick={reset}>Reset filters</button>
        </div>
      ) : (
        <div className="grid-cards">
          {sorted.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      )}
    </div>
  );
}
