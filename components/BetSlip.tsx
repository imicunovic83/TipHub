"use client";

import { useState } from "react";
import Link from "next/link";
import { useBetSlip } from "@/lib/useBetSlip";
import {
  bestOddsForTip,
  getMatchById,
  getTeamByCode,
  getTipBySlug,
  tips as ALL_TIPS,
} from "@/lib/data";

// Lookup by id (data layer indexes by slug, so build a small id -> tip map)
function getTipById(id: string) {
  return ALL_TIPS.find((t) => t.id === id);
}

export default function BetSlip() {
  const { ids, remove, clear, hydrated } = useBetSlip();
  const [open, setOpen] = useState(false);
  const [stake, setStake] = useState<string>("100");

  if (!hydrated || ids.length === 0) return null;

  const slipTips = ids
    .map(getTipById)
    .filter((t): t is NonNullable<ReturnType<typeof getTipById>> => Boolean(t));

  const combinedOdds = slipTips.reduce((acc, t) => acc * bestOddsForTip(t).value, 1);
  const stakeNum = Number(stake) || 0;
  const potential = combinedOdds * stakeNum;

  return (
    <>
      <div className="bet-slip-bar" role="region" aria-label="Bet slip summary">
        <button type="button" className="bet-slip-bar-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="bet-slip-bar-count">{ids.length}</span>
          <span className="bet-slip-bar-label">{ids.length === 1 ? "tip" : "tips"} in slip</span>
          <span className="bet-slip-bar-divider" aria-hidden="true">·</span>
          <span className="bet-slip-bar-odds">×{combinedOdds.toFixed(2)}</span>
          <span className="bet-slip-bar-cta">{open ? "Close ▾" : "View slip ▴"}</span>
        </button>
      </div>

      {open ? (
        <div className="bet-slip-drawer" role="dialog" aria-label="Bet slip details">
          <div className="bet-slip-drawer-head">
            <h3 className="surface-title" style={{ margin: 0 }}>Your bet slip</h3>
            <button type="button" className="btn-link" onClick={clear}>Clear all</button>
          </div>

          <ul className="bet-slip-list">
            {slipTips.map((t) => {
              const m = getMatchById(t.matchId);
              const home = m ? getTeamByCode(m.homeCode) : undefined;
              const away = m ? getTeamByCode(m.awayCode) : undefined;
              const best = bestOddsForTip(t);
              return (
                <li key={t.id} className="bet-slip-item">
                  <div className="bet-slip-item-main">
                    <div className="bet-slip-item-match">
                      {home?.name} <span className="tip-match-vs">vs</span> {away?.name}
                    </div>
                    <Link href={`/tips/${t.slug}`} className="bet-slip-item-prediction" onClick={() => setOpen(false)}>
                      {t.prediction}
                    </Link>
                  </div>
                  <div className="bet-slip-item-odds">{best.value.toFixed(2)}</div>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="bet-slip-item-remove"
                    aria-label={`Remove ${t.prediction} from slip`}
                    title="Remove"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="bet-slip-calc">
            <label htmlFor="bet-stake" className="field-label">Stake</label>
            <div className="bet-slip-calc-row">
              <input
                id="bet-stake"
                type="number"
                min="1"
                step="1"
                className="input"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
              <div className="bet-slip-calc-result">
                <div>
                  <div className="field-label">Combined odds</div>
                  <div className="bet-slip-calc-odds">×{combinedOdds.toFixed(2)}</div>
                </div>
                <div>
                  <div className="field-label">Potential return</div>
                  <div className="bet-slip-calc-payout">{potential.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <p className="disclaimer">
              Demo only. Combined odds are the product of each tip&apos;s best price; this is not a real bet.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
