// Valid prediction options per market + deterministic "reference odds" for the
// community competition. Shared by the client form and the API route so the
// two never disagree. No server-only imports here — safe to import in a
// "use client" component.

export const PREDICTION_OPTIONS: Record<string, string[]> = {
  "1X2": ["Home win (1)", "Draw (X)", "Away win (2)"],
  "Over/Under 2.5": ["Over 2.5", "Under 2.5"],
  BTTS: ["Yes", "No"],
  "Asian Handicap": ["Home -1", "Home +1", "Away -1", "Away +1"],
  "Correct Score": ["1-0", "2-0", "2-1", "1-1", "0-0", "0-1", "0-2", "1-2"],
};

// Plausible [min, max] odds band per prediction. Reference values for the
// competition only — not a live bookmaker price.
const ODDS_BANDS: Record<string, [number, number]> = {
  "Home win (1)": [1.45, 2.6],
  "Draw (X)": [3.0, 3.9],
  "Away win (2)": [1.9, 4.8],
  "Over 2.5": [1.7, 2.15],
  "Under 2.5": [1.7, 2.1],
  Yes: [1.65, 2.05],
  No: [1.7, 2.1],
  "Home -1": [2.2, 3.4],
  "Home +1": [1.3, 1.7],
  "Away -1": [3.0, 6.0],
  "Away +1": [1.4, 2.0],
  "1-0": [6.5, 9.0],
  "2-0": [8.0, 12.0],
  "2-1": [7.5, 10.0],
  "1-1": [6.0, 8.0],
  "0-0": [8.0, 11.0],
  "0-1": [7.5, 11.0],
  "0-2": [9.0, 13.0],
  "1-2": [8.5, 12.0],
};

export function isValidPrediction(market: string, prediction: string): boolean {
  return (PREDICTION_OPTIONS[market] ?? []).includes(prediction);
}

// Stable FNV-1a hash -> [0, 1). Same selection always yields the same odds, so
// two competitors backing the same pick on the same match get identical odds.
function hashUnit(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export function deriveCompetitionOdds(matchId: string, market: string, prediction: string): number {
  const band = ODDS_BANDS[prediction] ?? [1.5, 3.0];
  const t = hashUnit(`${matchId}|${market}|${prediction}`);
  const value = band[0] + t * (band[1] - band[0]);
  // Round to the nearest 0.05 like a real coupon.
  return Math.round(value * 20) / 20;
}
