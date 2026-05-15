"use client";

import { useMemo } from "react";
import { getAllTips, getMatchById } from "@/lib/data";

// Returns YYYY-MM-DD in UTC for a given ISO timestamp.
function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

// Friendly short label like "Thu 11 Jun".
function dayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const day = d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
  const num = d.getUTCDate();
  const mon = d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  return `${day} ${num} ${mon}`;
}

export default function MatchdayTimeline({
  selected,
  onSelect,
}: {
  selected: string | "all";
  onSelect: (day: string | "all") => void;
}) {
  // Collect distinct match dates across the whole tournament with tip counts.
  const days = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tip of getAllTips()) {
      const m = getMatchById(tip.matchId);
      if (!m) continue;
      const key = dayKey(m.kickoffISO);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  if (days.length === 0) return null;

  return (
    <div className="matchday-timeline" role="tablist" aria-label="Filter tips by match date">
      <button
        type="button"
        role="tab"
        aria-selected={selected === "all"}
        className={selected === "all" ? "matchday-pill is-active" : "matchday-pill"}
        onClick={() => onSelect("all")}
      >
        <span className="matchday-pill-label">All days</span>
        <span className="matchday-pill-count">{getAllTips().length}</span>
      </button>
      {days.map(([key, count]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={selected === key}
          className={selected === key ? "matchday-pill is-active" : "matchday-pill"}
          onClick={() => onSelect(key)}
        >
          <span className="matchday-pill-label">{dayLabel(key)}</span>
          <span className="matchday-pill-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
