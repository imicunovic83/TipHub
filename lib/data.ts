// Domain types and seed data for TipHub.
//
// All odds in this file are illustrative samples (snapshot-style) and are NOT
// live. They are based on plausible market values for the given matchups so
// the bookmaker comparison feature can be exercised end-to-end. See `disclaimer`
// in the footer and About page.

export type GroupCode =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type TipMarket =
  | "1X2"
  | "Over/Under 2.5"
  | "BTTS"
  | "Asian Handicap"
  | "Correct Score";

export type TipStatus = "pending" | "won" | "lost";

export type BookmakerSlug =
  | "mozzart"
  | "maxbet"
  | "soccerbet"
  | "meridian"
  | "admiral";

export interface Bookmaker {
  slug: BookmakerSlug;
  name: string;
  shortCode: string; // 2-3 letters used in the rounded logo cell
  country: string;
}

export interface Team {
  code: string; // 3-letter FIFA code
  name: string;
  group: GroupCode;
  flag: string; // 2-3 letter abbreviation rendered into the flag pill
}

export interface Match {
  id: string;
  group: GroupCode;
  homeCode: string;
  awayCode: string;
  kickoffISO: string; // ISO 8601 with timezone
  stadium: string;
  city: string;
  matchday: 1 | 2 | 3;
}

export interface Tipster {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  shortBio: string;
  longBio: string;
  initials: string;
  winRate: number;     // 0-100, lifetime
  roi: number;         // % return on investment, lifetime
  totalTips: number;   // lifetime tip count
  bestStreak: number;  // consecutive wins
  joinedYear: number;
  isHot: boolean;      // top-3 by win rate
}

export interface OddsOffer {
  bookmaker: BookmakerSlug;
  value: number;
}

export interface Tip {
  id: string;
  slug: string;
  matchId: string;
  tipsterSlug: string;
  market: TipMarket;
  prediction: string;     // e.g. "Argentina to win" or "Over 2.5 goals"
  shortReason: string;    // 1-line summary shown on the card
  analysis: string;       // longer multi-paragraph analysis on the detail page
  odds: OddsOffer[];      // exactly 5 entries — one per bookmaker
  confidence: 1 | 2 | 3 | 4 | 5;
  status: TipStatus;
  isPremium: boolean;
  postedAtISO: string;
}

// ---------------------------------------------------------------------------
// Bookmakers (5 real Serbian operators)
// ---------------------------------------------------------------------------
export const bookmakers: Bookmaker[] = [
  { slug: "mozzart",   name: "Mozzart Bet", shortCode: "MZ", country: "Serbia" },
  { slug: "maxbet",    name: "Maxbet",      shortCode: "MX", country: "Serbia" },
  { slug: "soccerbet", name: "Soccerbet",   shortCode: "SB", country: "Serbia" },
  { slug: "meridian",  name: "Meridianbet", shortCode: "ME", country: "Serbia" },
  { slug: "admiral",   name: "Admiral Bet", shortCode: "AD", country: "Serbia" },
];

// ---------------------------------------------------------------------------
// Teams — full FIFA World Cup 2026 group stage draw (48 teams, 12 groups).
// Source: FIFA Final Draw, 5 December 2025 + UEFA play-offs (March 2026).
// ---------------------------------------------------------------------------
export const teams: Team[] = [
  // Group A
  { code: "MEX", name: "Mexico",         group: "A", flag: "MX" },
  { code: "RSA", name: "South Africa",   group: "A", flag: "ZA" },
  { code: "KOR", name: "Korea Republic", group: "A", flag: "KR" },
  { code: "CZE", name: "Czechia",        group: "A", flag: "CZ" },

  // Group B
  { code: "CAN", name: "Canada",         group: "B", flag: "CA" },
  { code: "BIH", name: "Bosnia & Herz.", group: "B", flag: "BA" },
  { code: "QAT", name: "Qatar",          group: "B", flag: "QA" },
  { code: "SUI", name: "Switzerland",    group: "B", flag: "CH" },

  // Group C
  { code: "BRA", name: "Brazil",         group: "C", flag: "BR" },
  { code: "MAR", name: "Morocco",        group: "C", flag: "MA" },
  { code: "SCO", name: "Scotland",       group: "C", flag: "SC" },
  { code: "HAI", name: "Haiti",          group: "C", flag: "HT" },

  // Group D
  { code: "USA", name: "United States",  group: "D", flag: "US" },
  { code: "PAR", name: "Paraguay",       group: "D", flag: "PY" },
  { code: "AUS", name: "Australia",      group: "D", flag: "AU" },
  { code: "TUR", name: "Türkiye",        group: "D", flag: "TR" },

  // Group E
  { code: "GER", name: "Germany",        group: "E", flag: "DE" },
  { code: "CUW", name: "Curaçao",        group: "E", flag: "CW" },
  { code: "CIV", name: "Ivory Coast",    group: "E", flag: "CI" },
  { code: "ECU", name: "Ecuador",        group: "E", flag: "EC" },

  // Group F
  { code: "NED", name: "Netherlands",    group: "F", flag: "NL" },
  { code: "JPN", name: "Japan",          group: "F", flag: "JP" },
  { code: "SWE", name: "Sweden",         group: "F", flag: "SE" },
  { code: "TUN", name: "Tunisia",        group: "F", flag: "TN" },

  // Group G
  { code: "BEL", name: "Belgium",        group: "G", flag: "BE" },
  { code: "EGY", name: "Egypt",          group: "G", flag: "EG" },
  { code: "IRN", name: "Iran",           group: "G", flag: "IR" },
  { code: "NZL", name: "New Zealand",    group: "G", flag: "NZ" },

  // Group H
  { code: "ESP", name: "Spain",          group: "H", flag: "ES" },
  { code: "CPV", name: "Cape Verde",     group: "H", flag: "CV" },
  { code: "KSA", name: "Saudi Arabia",   group: "H", flag: "SA" },
  { code: "URU", name: "Uruguay",        group: "H", flag: "UY" },

  // Group I
  { code: "FRA", name: "France",         group: "I", flag: "FR" },
  { code: "SEN", name: "Senegal",        group: "I", flag: "SN" },
  { code: "IRQ", name: "Iraq",           group: "I", flag: "IQ" },
  { code: "NOR", name: "Norway",         group: "I", flag: "NO" },

  // Group J
  { code: "ARG", name: "Argentina",      group: "J", flag: "AR" },
  { code: "ALG", name: "Algeria",        group: "J", flag: "DZ" },
  { code: "AUT", name: "Austria",        group: "J", flag: "AT" },
  { code: "JOR", name: "Jordan",         group: "J", flag: "JO" },

  // Group K
  { code: "POR", name: "Portugal",       group: "K", flag: "PT" },
  { code: "COD", name: "DR Congo",       group: "K", flag: "CD" },
  { code: "UZB", name: "Uzbekistan",     group: "K", flag: "UZ" },
  { code: "COL", name: "Colombia",       group: "K", flag: "CO" },

  // Group L
  { code: "ENG", name: "England",        group: "L", flag: "EN" },
  { code: "CRO", name: "Croatia",        group: "L", flag: "HR" },
  { code: "GHA", name: "Ghana",          group: "L", flag: "GH" },
  { code: "PAN", name: "Panama",         group: "L", flag: "PA" },
];

export function getTeamByCode(code: string): Team | undefined {
  return teams.find((t) => t.code === code);
}

// ---------------------------------------------------------------------------
// Matches — group stage only, June 11–27 2026.
// Standard format: matchday 1 = (1v2, 3v4), matchday 2 = (1v3, 2v4),
// matchday 3 = (1v4, 2v3) where seeding 1 is the pot-1 seed of each group.
// Confirmed dates from FIFA / Sky Sports schedule used where known.
// ---------------------------------------------------------------------------
export const matches: Match[] = [
  // ----- Group A -----
  { id: "m-a1", group: "A", homeCode: "MEX", awayCode: "RSA", kickoffISO: "2026-06-11T19:00:00-06:00", stadium: "Estadio Azteca",   city: "Mexico City",  matchday: 1 },
  { id: "m-a2", group: "A", homeCode: "KOR", awayCode: "CZE", kickoffISO: "2026-06-11T22:00:00-06:00", stadium: "Estadio Akron",    city: "Guadalajara",  matchday: 1 },
  { id: "m-a3", group: "A", homeCode: "CZE", awayCode: "RSA", kickoffISO: "2026-06-18T12:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 2 },
  { id: "m-a4", group: "A", homeCode: "MEX", awayCode: "KOR", kickoffISO: "2026-06-18T21:00:00-06:00", stadium: "Estadio Akron",    city: "Guadalajara",  matchday: 2 },
  { id: "m-a5", group: "A", homeCode: "MEX", awayCode: "CZE", kickoffISO: "2026-06-24T15:00:00-06:00", stadium: "Estadio Azteca",   city: "Mexico City",  matchday: 3 },
  { id: "m-a6", group: "A", homeCode: "RSA", awayCode: "KOR", kickoffISO: "2026-06-24T15:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 3 },

  // ----- Group B -----
  { id: "m-b1", group: "B", homeCode: "CAN", awayCode: "BIH", kickoffISO: "2026-06-12T19:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 1 },
  { id: "m-b2", group: "B", homeCode: "QAT", awayCode: "SUI", kickoffISO: "2026-06-12T16:00:00-07:00", stadium: "BC Place",         city: "Vancouver",    matchday: 1 },
  { id: "m-b3", group: "B", homeCode: "SUI", awayCode: "BIH", kickoffISO: "2026-06-19T13:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 2 },
  { id: "m-b4", group: "B", homeCode: "CAN", awayCode: "QAT", kickoffISO: "2026-06-19T16:00:00-07:00", stadium: "BC Place",         city: "Vancouver",    matchday: 2 },
  { id: "m-b5", group: "B", homeCode: "CAN", awayCode: "SUI", kickoffISO: "2026-06-25T15:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 3 },
  { id: "m-b6", group: "B", homeCode: "BIH", awayCode: "QAT", kickoffISO: "2026-06-25T15:00:00-07:00", stadium: "BC Place",         city: "Vancouver",    matchday: 3 },

  // ----- Group C -----
  { id: "m-c1", group: "C", homeCode: "BRA", awayCode: "MAR", kickoffISO: "2026-06-13T18:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 1 },
  { id: "m-c2", group: "C", homeCode: "HAI", awayCode: "SCO", kickoffISO: "2026-06-13T21:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough",   matchday: 1 },
  { id: "m-c3", group: "C", homeCode: "SCO", awayCode: "MAR", kickoffISO: "2026-06-19T18:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough",   matchday: 2 },
  { id: "m-c4", group: "C", homeCode: "BRA", awayCode: "HAI", kickoffISO: "2026-06-19T20:30:00-04:00", stadium: "Lincoln Financial Field", city: "Philadelphia", matchday: 2 },
  { id: "m-c5", group: "C", homeCode: "SCO", awayCode: "BRA", kickoffISO: "2026-06-24T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 3 },
  { id: "m-c6", group: "C", homeCode: "MAR", awayCode: "HAI", kickoffISO: "2026-06-24T18:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 3 },

  // ----- Group D -----
  { id: "m-d1", group: "D", homeCode: "USA", awayCode: "PAR", kickoffISO: "2026-06-12T19:00:00-07:00", stadium: "SoFi Stadium",     city: "Inglewood",    matchday: 1 },
  { id: "m-d2", group: "D", homeCode: "AUS", awayCode: "TUR", kickoffISO: "2026-06-12T15:00:00-05:00", stadium: "AT&T Stadium",     city: "Arlington",    matchday: 1 },
  { id: "m-d3", group: "D", homeCode: "TUR", awayCode: "PAR", kickoffISO: "2026-06-18T16:00:00-05:00", stadium: "NRG Stadium",      city: "Houston",      matchday: 2 },
  { id: "m-d4", group: "D", homeCode: "USA", awayCode: "AUS", kickoffISO: "2026-06-18T19:00:00-07:00", stadium: "SoFi Stadium",     city: "Inglewood",    matchday: 2 },
  { id: "m-d5", group: "D", homeCode: "USA", awayCode: "TUR", kickoffISO: "2026-06-25T18:00:00-04:00", stadium: "Lincoln Financial Field", city: "Philadelphia", matchday: 3 },
  { id: "m-d6", group: "D", homeCode: "PAR", awayCode: "AUS", kickoffISO: "2026-06-25T15:00:00-05:00", stadium: "Arrowhead Stadium", city: "Kansas City", matchday: 3 },

  // ----- Group E -----
  { id: "m-e1", group: "E", homeCode: "GER", awayCode: "CUW", kickoffISO: "2026-06-13T15:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 1 },
  { id: "m-e2", group: "E", homeCode: "CIV", awayCode: "ECU", kickoffISO: "2026-06-13T13:00:00-07:00", stadium: "Lumen Field",      city: "Seattle",      matchday: 1 },
  { id: "m-e3", group: "E", homeCode: "ECU", awayCode: "CUW", kickoffISO: "2026-06-20T13:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 2 },
  { id: "m-e4", group: "E", homeCode: "GER", awayCode: "CIV", kickoffISO: "2026-06-20T16:00:00-07:00", stadium: "Lumen Field",      city: "Seattle",      matchday: 2 },
  { id: "m-e5", group: "E", homeCode: "GER", awayCode: "ECU", kickoffISO: "2026-06-26T18:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 3 },
  { id: "m-e6", group: "E", homeCode: "CUW", awayCode: "CIV", kickoffISO: "2026-06-26T15:00:00-07:00", stadium: "Lumen Field",      city: "Seattle",      matchday: 3 },

  // ----- Group F -----
  { id: "m-f1", group: "F", homeCode: "NED", awayCode: "JPN", kickoffISO: "2026-06-14T15:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 1 },
  { id: "m-f2", group: "F", homeCode: "SWE", awayCode: "TUN", kickoffISO: "2026-06-14T18:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 1 },
  { id: "m-f3", group: "F", homeCode: "TUN", awayCode: "JPN", kickoffISO: "2026-06-20T19:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 2 },
  { id: "m-f4", group: "F", homeCode: "NED", awayCode: "SWE", kickoffISO: "2026-06-20T15:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 2 },
  { id: "m-f5", group: "F", homeCode: "NED", awayCode: "TUN", kickoffISO: "2026-06-26T15:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 3 },
  { id: "m-f6", group: "F", homeCode: "JPN", awayCode: "SWE", kickoffISO: "2026-06-26T18:00:00-04:00", stadium: "BC Place",         city: "Vancouver",    matchday: 3 },

  // ----- Group G -----
  { id: "m-g1", group: "G", homeCode: "BEL", awayCode: "EGY", kickoffISO: "2026-06-15T15:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 1 },
  { id: "m-g2", group: "G", homeCode: "IRN", awayCode: "NZL", kickoffISO: "2026-06-15T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 1 },
  { id: "m-g3", group: "G", homeCode: "NZL", awayCode: "EGY", kickoffISO: "2026-06-21T13:00:00-07:00", stadium: "Lumen Field",      city: "Seattle",      matchday: 2 },
  { id: "m-g4", group: "G", homeCode: "BEL", awayCode: "IRN", kickoffISO: "2026-06-21T16:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 2 },
  { id: "m-g5", group: "G", homeCode: "BEL", awayCode: "NZL", kickoffISO: "2026-06-27T15:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 3 },
  { id: "m-g6", group: "G", homeCode: "EGY", awayCode: "IRN", kickoffISO: "2026-06-27T15:00:00-04:00", stadium: "Lincoln Financial Field", city: "Philadelphia", matchday: 3 },

  // ----- Group H -----
  { id: "m-h1", group: "H", homeCode: "ESP", awayCode: "CPV", kickoffISO: "2026-06-15T16:00:00-05:00", stadium: "AT&T Stadium",     city: "Arlington",    matchday: 1 },
  { id: "m-h2", group: "H", homeCode: "KSA", awayCode: "URU", kickoffISO: "2026-06-15T19:00:00-05:00", stadium: "NRG Stadium",      city: "Houston",      matchday: 1 },
  { id: "m-h3", group: "H", homeCode: "URU", awayCode: "CPV", kickoffISO: "2026-06-21T15:00:00-05:00", stadium: "Arrowhead Stadium", city: "Kansas City", matchday: 2 },
  { id: "m-h4", group: "H", homeCode: "ESP", awayCode: "KSA", kickoffISO: "2026-06-21T18:00:00-05:00", stadium: "AT&T Stadium",     city: "Arlington",    matchday: 2 },
  { id: "m-h5", group: "H", homeCode: "ESP", awayCode: "URU", kickoffISO: "2026-06-27T18:00:00-05:00", stadium: "NRG Stadium",      city: "Houston",      matchday: 3 },
  { id: "m-h6", group: "H", homeCode: "CPV", awayCode: "KSA", kickoffISO: "2026-06-27T15:00:00-05:00", stadium: "Arrowhead Stadium", city: "Kansas City", matchday: 3 },

  // ----- Group I -----
  { id: "m-i1", group: "I", homeCode: "FRA", awayCode: "SEN", kickoffISO: "2026-06-16T18:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 1 },
  { id: "m-i2", group: "I", homeCode: "IRQ", awayCode: "NOR", kickoffISO: "2026-06-16T15:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough",   matchday: 1 },
  { id: "m-i3", group: "I", homeCode: "NOR", awayCode: "SEN", kickoffISO: "2026-06-22T15:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough",   matchday: 2 },
  { id: "m-i4", group: "I", homeCode: "FRA", awayCode: "IRQ", kickoffISO: "2026-06-22T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 2 },
  { id: "m-i5", group: "I", homeCode: "FRA", awayCode: "NOR", kickoffISO: "2026-06-27T18:00:00-07:00", stadium: "SoFi Stadium",     city: "Inglewood",    matchday: 3 },
  { id: "m-i6", group: "I", homeCode: "SEN", awayCode: "IRQ", kickoffISO: "2026-06-27T15:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 3 },

  // ----- Group J -----
  { id: "m-j1", group: "J", homeCode: "ARG", awayCode: "ALG", kickoffISO: "2026-06-16T16:00:00-05:00", stadium: "AT&T Stadium",     city: "Arlington",    matchday: 1 },
  { id: "m-j2", group: "J", homeCode: "AUT", awayCode: "JOR", kickoffISO: "2026-06-16T19:00:00-05:00", stadium: "Arrowhead Stadium", city: "Kansas City", matchday: 1 },
  { id: "m-j3", group: "J", homeCode: "JOR", awayCode: "ALG", kickoffISO: "2026-06-22T15:00:00-05:00", stadium: "NRG Stadium",      city: "Houston",      matchday: 2 },
  { id: "m-j4", group: "J", homeCode: "ARG", awayCode: "AUT", kickoffISO: "2026-06-22T18:00:00-05:00", stadium: "AT&T Stadium",     city: "Arlington",    matchday: 2 },
  { id: "m-j5", group: "J", homeCode: "ARG", awayCode: "JOR", kickoffISO: "2026-06-27T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 3 },
  { id: "m-j6", group: "J", homeCode: "ALG", awayCode: "AUT", kickoffISO: "2026-06-27T15:00:00-04:00", stadium: "BMO Field",        city: "Toronto",      matchday: 3 },

  // ----- Group K -----
  { id: "m-k1", group: "K", homeCode: "POR", awayCode: "COD", kickoffISO: "2026-06-17T18:00:00-04:00", stadium: "MetLife Stadium",  city: "East Rutherford", matchday: 1 },
  { id: "m-k2", group: "K", homeCode: "UZB", awayCode: "COL", kickoffISO: "2026-06-17T15:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 1 },
  { id: "m-k3", group: "K", homeCode: "COL", awayCode: "COD", kickoffISO: "2026-06-23T13:00:00-07:00", stadium: "SoFi Stadium",     city: "Inglewood",    matchday: 2 },
  { id: "m-k4", group: "K", homeCode: "POR", awayCode: "UZB", kickoffISO: "2026-06-23T16:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 2 },
  { id: "m-k5", group: "K", homeCode: "POR", awayCode: "COL", kickoffISO: "2026-06-27T18:00:00-07:00", stadium: "Lumen Field",      city: "Seattle",      matchday: 3 },
  { id: "m-k6", group: "K", homeCode: "COD", awayCode: "UZB", kickoffISO: "2026-06-27T15:00:00-07:00", stadium: "Levi's Stadium",   city: "Santa Clara",  matchday: 3 },

  // ----- Group L -----
  { id: "m-l1", group: "L", homeCode: "ENG", awayCode: "CRO", kickoffISO: "2026-06-17T15:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 1 },
  { id: "m-l2", group: "L", homeCode: "GHA", awayCode: "PAN", kickoffISO: "2026-06-17T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 1 },
  { id: "m-l3", group: "L", homeCode: "PAN", awayCode: "CRO", kickoffISO: "2026-06-23T15:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta", matchday: 2 },
  { id: "m-l4", group: "L", homeCode: "ENG", awayCode: "GHA", kickoffISO: "2026-06-23T18:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami",       matchday: 2 },
  { id: "m-l5", group: "L", homeCode: "ENG", awayCode: "PAN", kickoffISO: "2026-06-27T18:00:00-04:00", stadium: "Lincoln Financial Field", city: "Philadelphia", matchday: 3 },
  { id: "m-l6", group: "L", homeCode: "CRO", awayCode: "GHA", kickoffISO: "2026-06-27T15:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough",   matchday: 3 },
];

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

// ---------------------------------------------------------------------------
// Tipsters
// ---------------------------------------------------------------------------
export const tipsters: Tipster[] = [
  {
    id: "t1",
    slug: "marko-jovic",
    name: "Marko Jović",
    specialty: "1X2 specialist",
    shortBio: "Match-result expert focused on European and South American teams.",
    longBio:
      "Marko has been calling 1X2 markets professionally for over eight years. He combines xG models with squad-availability tracking, and is best known for his work on European qualifiers. His sharpest reads tend to come on tight derbies where bookmakers under-price the value of home advantage.",
    initials: "MJ",
    winRate: 62,
    roi: 14.2,
    totalTips: 1240,
    bestStreak: 11,
    joinedYear: 2018,
    isHot: true,
  },
  {
    id: "t2",
    slug: "ana-petrovic",
    name: "Ana Petrović",
    specialty: "Over/Under expert",
    shortBio: "Goal-line analyst with a strong record on Over/Under 2.5 markets.",
    longBio:
      "Ana built her reputation modelling shot quality and pace-of-play across the top European leagues. Her totals approach uses opponent-adjusted xG plus referee tendencies. She prefers fewer high-conviction tips per round over volume.",
    initials: "AP",
    winRate: 58,
    roi: 9.8,
    totalTips: 870,
    bestStreak: 8,
    joinedYear: 2020,
    isHot: false,
  },
  {
    id: "t3",
    slug: "stefan-hadzic",
    name: "Stefan Hadžić",
    specialty: "Both Teams to Score",
    shortBio: "BTTS-only tipster — every tip lives or dies by goals at both ends.",
    longBio:
      "Stefan picks BTTS exclusively. He runs a simple but disciplined model on team scoring frequency and clean-sheet rate over the last 10 matches, weighting away xG more heavily. His lifetime hit rate of 65% is the highest among TipHub specialists.",
    initials: "SH",
    winRate: 65,
    roi: 18.6,
    totalTips: 540,
    bestStreak: 14,
    joinedYear: 2019,
    isHot: true,
  },
  {
    id: "t4",
    slug: "mark-holloway",
    name: "Mark Holloway",
    specialty: "Asian Handicap",
    shortBio: "Handicap specialist with a sharp read on favourite vs underdog spreads.",
    longBio:
      "Mark spent six years on a sportsbook trading desk before going independent. He focuses on Asian Handicap markets where soft lines move late, and is one of the few TipHub tipsters who regularly closes positions early when the line shifts in his favour.",
    initials: "MH",
    winRate: 55,
    roi: 7.4,
    totalTips: 980,
    bestStreak: 9,
    joinedYear: 2017,
    isHot: false,
  },
  {
    id: "t5",
    slug: "jelena-stankovic",
    name: "Jelena Stanković",
    specialty: "Correct Score",
    shortBio: "High-risk Correct Score predictions — low strike rate, big payouts.",
    longBio:
      "Jelena is TipHub's lottery-ticket tipster. Her hit rate is intentionally low (around 28%) because Correct Score markets pay out at long odds. Followers staking small flat amounts have averaged a positive ROI thanks to one or two outsized wins per month.",
    initials: "JS",
    winRate: 28,
    roi: 22.5,
    totalTips: 410,
    bestStreak: 4,
    joinedYear: 2021,
    isHot: false,
  },
  {
    id: "t6",
    slug: "nikola-djuric",
    name: "Nikola Đurić",
    specialty: "Generalist",
    shortBio: "All-markets tipster who builds positions across many small edges.",
    longBio:
      "Nikola is TipHub's generalist — he posts tips across every market and prefers a portfolio approach to single-market specialists. His edges are individually thin but his volume and discipline have produced a steady 60% hit rate over five years.",
    initials: "NĐ",
    winRate: 60,
    roi: 11.0,
    totalTips: 2160,
    bestStreak: 10,
    joinedYear: 2019,
    isHot: true,
  },
];

export function getTipsterBySlug(slug: string): Tipster | undefined {
  return tipsters.find((t) => t.slug === slug);
}

export function getTopTipsters(n: number = 3): Tipster[] {
  return [...tipsters].sort((a, b) => b.winRate - a.winRate).slice(0, n);
}

// ---------------------------------------------------------------------------
// Tips
//
// Helper: build a 5-element odds array from a base value. Each bookmaker
// gets a small ±2-7% spread around the base so one stands out as "best".
// The order of bookmakers is randomised per tip via the offsets array so
// no single operator always wins.
// ---------------------------------------------------------------------------
function odds(
  base: number,
  offsets: [number, number, number, number, number],
): OddsOffer[] {
  const slugs: BookmakerSlug[] = ["mozzart", "maxbet", "soccerbet", "meridian", "admiral"];
  return slugs.map((slug, i) => ({
    bookmaker: slug,
    value: Math.round((base + offsets[i]) * 100) / 100,
  }));
}

export const tips: Tip[] = [
  // ===== Marko Jović — 1X2 specialist (8 tips) =====
  {
    id: "tip-001",
    slug: "argentina-to-beat-algeria",
    matchId: "m-j1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Argentina to win",
    shortReason: "Reigning champions a class above; Messi-Mac Allister axis untouched.",
    analysis:
      "Argentina open against Algeria on familiar territory in Texas, where they've trained twice over the last 18 months. Algeria reach this World Cup for the first time since 2014 and qualified through a tight CAF play-off. Scaloni's side hasn't lost an opening WC group game since 2002, and Argentina's 1X2 conversion against African opposition since 2022 sits at 8 wins from 9. The price under 1.40 reflects that gap, but the +1 handicap looks short — back the straight result.",
    odds: odds(1.42, [-0.02, 0.00, 0.03, 0.01, -0.01]),
    confidence: 5,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-12T10:30:00Z",
  },
  {
    id: "tip-002",
    slug: "england-draw-or-win-vs-croatia",
    matchId: "m-l1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "England (1)",
    shortReason: "Croatia's midfield ageing; England's press should win the duels.",
    analysis:
      "England open Group L against a Croatia side that retains Modrić and Brozović but has lost a step in transition. Tuchel's England press higher than under Southgate and the front three of Saka, Kane and Bellingham creates a clear edge in the final third. Croatia historically struggle in opening matches outside Europe — back England outright at the available 2.05.",
    odds: odds(2.05, [0.00, 0.05, -0.03, 0.02, -0.02]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T08:15:00Z",
  },
  {
    id: "tip-003",
    slug: "brazil-handle-morocco-opener",
    matchId: "m-c1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Brazil to win",
    shortReason: "Ancelotti's Brazil look balanced; Morocco short on Hakimi's services.",
    analysis:
      "Morocco famously dumped Spain and Portugal out of Qatar 2022, but four years on the squad has aged and key full-back Achraf Hakimi is racing back from injury. Brazil under Ancelotti have tightened defensively and Vinícius/Rodrygo offer the kind of one-on-one attacking that hurts Morocco's compact mid-block. Take Brazil at 1.85.",
    odds: odds(1.85, [0.05, -0.02, 0.00, 0.03, -0.01]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T11:40:00Z",
  },
  {
    id: "tip-004",
    slug: "germany-to-beat-curacao",
    matchId: "m-e1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Germany to win",
    shortReason: "Tournament debutants Curaçao won't survive Germany's possession game.",
    analysis:
      "Curaçao's qualification is one of the great stories of the cycle, but the gap to Germany is enormous. Nagelsmann's side will dominate possession comfortably above 70%. The real question is the goal margin — over 3.5 looks juicy, but I'm sticking to the straight result here at 1.18.",
    odds: odds(1.18, [-0.01, 0.00, 0.02, 0.01, -0.02]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T09:00:00Z",
  },
  {
    id: "tip-005",
    slug: "spain-to-beat-cape-verde",
    matchId: "m-h1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Spain to win",
    shortReason: "Cape Verde plucky but Spain control tournament openers.",
    analysis:
      "Spain are unbeaten in their last 11 group-stage opening matches. De la Fuente's tiki-taka revival under Yamal and Pedri is producing high possession numbers and quick chance creation. Cape Verde will defend deep — back Spain at 1.20.",
    odds: odds(1.20, [-0.01, 0.02, 0.00, 0.01, -0.01]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T10:15:00Z",
  },
  {
    id: "tip-006",
    slug: "draw-mexico-korea",
    matchId: "m-a4",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Draw (X)",
    shortReason: "Korea's energy plus Mexican home pressure produces stalemates.",
    analysis:
      "Mexico will be tense — they haven't reached the round-of-16 in their home World Cup before. Korea Republic press intensely and have the pace to break. These two have drawn 4 of their last 6 meetings. Take the draw at 3.40.",
    odds: odds(3.40, [0.10, 0.05, -0.05, 0.08, 0.00]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T07:30:00Z",
  },
  {
    id: "tip-007",
    slug: "switzerland-to-beat-qatar",
    matchId: "m-b2",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "Switzerland to win",
    shortReason: "Qatar's last WC was at home; their road form is a different story.",
    analysis:
      "Qatar enter their second consecutive World Cup, but their record outside Doha is poor — just 2 wins in 11 friendlies away from home since 2022. Switzerland are organised and have a true No. 9 in Embolo. Back the Swiss at 1.65.",
    odds: odds(1.65, [0.03, -0.02, 0.00, 0.05, 0.01]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T08:00:00Z",
  },
  {
    id: "tip-008",
    slug: "france-to-beat-senegal",
    matchId: "m-i1",
    tipsterSlug: "marko-jovic",
    market: "1X2",
    prediction: "France to win",
    shortReason: "Mbappé back from injury; France's depth tells in 90 minutes.",
    analysis:
      "Senegal are dangerous and Sadio Mané remains a difference-maker, but France's squad depth — Mbappé, Saliba, Tchouaméni, Doué — is on another tier. Deschamps' record in opening WC matches is 4 wins from 4. Back France at 1.55.",
    odds: odds(1.55, [-0.02, 0.03, 0.05, 0.00, 0.02]),
    confidence: 5,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-15T09:45:00Z",
  },

  // ===== Ana Petrović — Over/Under expert (6 tips) =====
  {
    id: "tip-009",
    slug: "over-2-5-brazil-morocco",
    matchId: "m-c1",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Over 2.5 goals",
    shortReason: "Brazil's xG vs Morocco's open midfield → goals at both ends.",
    analysis:
      "Morocco have averaged 2.4 goals per match in their last 6 friendlies, and Brazil's xG of 1.95 per game makes this one of the highest projected totals of matchday 1. The opening match nerves usually kill the under, but with Vinícius and En-Nesyri both starting, the over at 1.78 is the play.",
    odds: odds(1.78, [0.02, 0.04, 0.00, 0.03, -0.01]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T13:20:00Z",
  },
  {
    id: "tip-010",
    slug: "under-netherlands-japan",
    matchId: "m-f1",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Under 2.5 goals",
    shortReason: "Japan's compact 4-1-4-1 has frustrated even Spain — totals stay low.",
    analysis:
      "Japan have shut down high-quality opposition repeatedly under Moriyasu, and the Dutch attack — minus an injured Cody Gakpo — is a level below its 2022 peak. Both sides will be cagey on matchday 1. The under at 2.05 has a clear edge.",
    odds: odds(2.05, [-0.05, 0.00, 0.08, 0.02, 0.05]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T14:00:00Z",
  },
  {
    id: "tip-011",
    slug: "over-2-5-germany-curacao",
    matchId: "m-e1",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Over 2.5 goals",
    shortReason: "Germany's depth in attack will ruthlessly punish Curaçao's gaps.",
    analysis:
      "This is one of the largest skill gaps of the group stage. Germany have scored 3+ in 9 of their last 12 games. Even with a slow start, expect at least 3 goals — over 2.5 at 1.32 is essentially a certainty.",
    odds: odds(1.32, [0.00, 0.02, -0.01, 0.01, 0.03]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T15:30:00Z",
  },
  {
    id: "tip-012",
    slug: "under-mexico-rsa-opener",
    matchId: "m-a1",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Under 2.5 goals",
    shortReason: "Tournament-opener nerves + altitude in Mexico City = low scoring.",
    analysis:
      "Opening matches of the WC have averaged 1.8 goals in the last 5 tournaments. Mexico City's altitude favours the home side but it slows the visiting attack to a crawl. South Africa qualified through CAF on a sturdy 5-3-2 base. Under 2.5 at 1.95 is solid.",
    odds: odds(1.95, [0.00, -0.03, 0.05, 0.02, 0.04]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T17:00:00Z",
  },
  {
    id: "tip-013",
    slug: "over-france-senegal",
    matchId: "m-i1",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Over 2.5 goals",
    shortReason: "Mbappé and Mané on the same pitch rarely produces a low-scoring game.",
    analysis:
      "France-Senegal projects to 3.1 expected goals on my model. Senegal will commit numbers forward against a France side missing Theo Hernández. The over at 1.75 has 4-5% edge.",
    odds: odds(1.75, [0.00, 0.05, 0.02, 0.04, -0.02]),
    confidence: 4,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-15T08:30:00Z",
  },
  {
    id: "tip-014",
    slug: "over-portugal-uzbekistan",
    matchId: "m-k4",
    tipsterSlug: "ana-petrovic",
    market: "Over/Under 2.5",
    prediction: "Over 2.5 goals",
    shortReason: "Portugal need to chase goal difference; Uzbekistan are open in transition.",
    analysis:
      "By matchday 2 Portugal will know exactly what they need on goal difference. Ronaldo's farewell tour will see him chase. Uzbekistan are debutants but they qualified by scoring goals. Over 2.5 at 1.55 is very fair.",
    odds: odds(1.55, [0.02, 0.00, 0.04, 0.01, 0.03]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T10:00:00Z",
  },

  // ===== Stefan Hadžić — BTTS specialist (5 tips) =====
  {
    id: "tip-015",
    slug: "btts-yes-france-senegal",
    matchId: "m-i1",
    tipsterSlug: "stefan-hadzic",
    market: "BTTS",
    prediction: "Both teams to score: Yes",
    shortReason: "Senegal score in 7 of last 8 vs European top teams.",
    analysis:
      "Senegal's attack carries genuine pedigree (Sadio Mané, Boulaye Dia) and France haven't kept a clean sheet against an African nation in their last 9 attempts. BTTS yes at 1.70 looks generous.",
    odds: odds(1.70, [-0.03, 0.00, 0.05, 0.02, 0.04]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T19:00:00Z",
  },
  {
    id: "tip-016",
    slug: "btts-yes-brazil-morocco",
    matchId: "m-c1",
    tipsterSlug: "stefan-hadzic",
    market: "BTTS",
    prediction: "Both teams to score: Yes",
    shortReason: "Brazil's high line vs Morocco's En-Nesyri = goals both ways.",
    analysis:
      "Morocco are most dangerous in transition and Brazil's high defensive line under Ancelotti has been exposed in friendlies vs South Korea and Japan. En-Nesyri is in form. BTTS yes at 1.80 is the call.",
    odds: odds(1.80, [0.02, 0.04, 0.00, 0.03, 0.05]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T11:00:00Z",
  },
  {
    id: "tip-017",
    slug: "btts-yes-belgium-iran",
    matchId: "m-g4",
    tipsterSlug: "stefan-hadzic",
    market: "BTTS",
    prediction: "Both teams to score: Yes",
    shortReason: "Iran will be chasing on matchday 2; Belgium too good not to score.",
    analysis:
      "Likely a must-win for Iran by then. They'll commit numbers forward. Belgium's De Bruyne–Lukaku combination still functions in tournaments. BTTS yes at 1.68 is excellent value.",
    odds: odds(1.68, [0.00, 0.02, 0.05, 0.03, 0.04]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T12:00:00Z",
  },
  {
    id: "tip-018",
    slug: "btts-no-germany-curacao",
    matchId: "m-e1",
    tipsterSlug: "stefan-hadzic",
    market: "BTTS",
    prediction: "Both teams to score: No",
    shortReason: "Curaçao's qualifying campaign averaged 0.7 goals per game.",
    analysis:
      "Tournament debutants Curaçao scored only 8 goals in 11 qualifying matches. Germany's defensive structure under Nagelsmann is far above what Curaçao have faced. BTTS no at 1.45 is a comfortable lean.",
    odds: odds(1.45, [0.02, 0.05, 0.00, 0.03, 0.04]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T13:30:00Z",
  },
  {
    id: "tip-019",
    slug: "btts-yes-portugal-colombia",
    matchId: "m-k5",
    tipsterSlug: "stefan-hadzic",
    market: "BTTS",
    prediction: "Both teams to score: Yes",
    shortReason: "Two attacking sides, both likely needing a result on matchday 3.",
    analysis:
      "By matchday 3 both Portugal and Colombia will probably need to win to top the group. Ronaldo will start. James Rodríguez is fit. Two attacking line-ups = goals both ways. BTTS yes at 1.62.",
    odds: odds(1.62, [0.03, 0.00, 0.04, 0.05, 0.02]),
    confidence: 5,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-15T14:30:00Z",
  },

  // ===== Mark Holloway — Asian Handicap (5 tips) =====
  {
    id: "tip-020",
    slug: "ah-argentina-minus-1-vs-jordan",
    matchId: "m-j5",
    tipsterSlug: "mark-holloway",
    market: "Asian Handicap",
    prediction: "Argentina −1.5",
    shortReason: "Argentina need a big win on matchday 3 for top-spot seeding.",
    analysis:
      "Jordan are the weakest team in Group J. By matchday 3 Argentina will be motivated to top the group for an easier R32 path. Scaloni rests no-one. Argentina −1.5 at 1.85 is the cleanest path to value.",
    odds: odds(1.85, [0.02, 0.00, 0.04, 0.05, 0.03]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T20:00:00Z",
  },
  {
    id: "tip-021",
    slug: "ah-spain-minus-1-25-vs-saudi",
    matchId: "m-h4",
    tipsterSlug: "mark-holloway",
    market: "Asian Handicap",
    prediction: "Spain −1.25",
    shortReason: "Saudi pulled off the upset in Qatar — Spain don't make that mistake twice.",
    analysis:
      "Saudi Arabia famously beat Argentina in Qatar 2022. Spain have studied that match in detail and are favourites to top Group H. Spain −1.25 at 1.95 strikes the balance between margin and price.",
    odds: odds(1.95, [-0.02, 0.03, 0.00, 0.04, 0.05]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T20:00:00Z",
  },
  {
    id: "tip-022",
    slug: "ah-england-minus-1-vs-panama",
    matchId: "m-l5",
    tipsterSlug: "mark-holloway",
    market: "Asian Handicap",
    prediction: "England −1",
    shortReason: "England 6-1 Panama in 2018; Tuchel will want a big margin late in the group.",
    analysis:
      "Panama have improved since 2018 but the gulf in talent remains. England have historically run up scores when they need them. −1 at 1.70 is generous given their attacking depth.",
    odds: odds(1.70, [0.00, 0.02, 0.05, 0.03, 0.04]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T11:00:00Z",
  },
  {
    id: "tip-023",
    slug: "ah-france-minus-0-5-vs-iraq",
    matchId: "m-i4",
    tipsterSlug: "mark-holloway",
    market: "Asian Handicap",
    prediction: "France −0.5",
    shortReason: "Effectively backing France to win — the −0.5 line removes draw risk.",
    analysis:
      "Iraq qualified through Asian playoffs and they're well-organised, but France should win this comfortably even with rotation. The straight 1X2 prices France too short — the −0.5 AH at 1.32 has the same outcome with marginally better odds where the no-bet on draw helps.",
    odds: odds(1.32, [0.00, 0.02, 0.04, 0.03, 0.05]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T12:30:00Z",
  },
  {
    id: "tip-024",
    slug: "ah-portugal-minus-1-5-congo",
    matchId: "m-k1",
    tipsterSlug: "mark-holloway",
    market: "Asian Handicap",
    prediction: "Portugal −1.5",
    shortReason: "Portugal openers have been routs — Ronaldo will want a goal.",
    analysis:
      "Portugal have scored 3+ in 5 of their last 7 opening matches. DR Congo are dangerous on transitions but defensively suspect. Portugal −1.5 at 2.00 looks like a 60% probability proposition priced as 50%.",
    odds: odds(2.00, [0.05, 0.02, 0.00, 0.03, 0.04]),
    confidence: 3,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-15T13:00:00Z",
  },

  // ===== Jelena Stanković — Correct Score (4 tips) =====
  {
    id: "tip-025",
    slug: "cs-argentina-2-0-algeria",
    matchId: "m-j1",
    tipsterSlug: "jelena-stankovic",
    market: "Correct Score",
    prediction: "Argentina 2 - 0 Algeria",
    shortReason: "Most likely scoreline: dominant Argentina but not a goal-fest opener.",
    analysis:
      "Argentina's most common winning scoreline since 2022 is 2-0 (8 of their 24 wins). Algeria are good defensively in deep blocks. The 2-0 at 8.00 has roughly a 14% probability — clear value.",
    odds: odds(8.00, [0.50, 0.00, -0.30, 0.20, 0.40]),
    confidence: 3,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-13T22:00:00Z",
  },
  {
    id: "tip-026",
    slug: "cs-mexico-1-1-rsa",
    matchId: "m-a1",
    tipsterSlug: "jelena-stankovic",
    market: "Correct Score",
    prediction: "Mexico 1 - 1 South Africa",
    shortReason: "Tense WC opener with altitude leveller — 1-1 at huge price.",
    analysis:
      "Tournament openers and altitude both depress scoring. South Africa are competent. 1-1 sits at 7.50 but my model has it at 9% probability — fair value.",
    odds: odds(7.50, [0.40, 0.20, 0.00, 0.30, 0.50]),
    confidence: 2,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-14T22:00:00Z",
  },
  {
    id: "tip-027",
    slug: "cs-germany-3-0-curacao",
    matchId: "m-e1",
    tipsterSlug: "jelena-stankovic",
    market: "Correct Score",
    prediction: "Germany 3 - 0 Curaçao",
    shortReason: "Mismatch with no Curaçao reply — 3-0 is the modal forecast.",
    analysis:
      "Germany have won 3-0 in 5 of their last 14 matches against teams ranked outside the top 50. Curaçao are unlikely to score. 3-0 at 7.00 looks like value vs the 4-0+ rolls.",
    odds: odds(7.00, [-0.20, 0.30, 0.10, 0.40, 0.20]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T09:00:00Z",
  },
  {
    id: "tip-028",
    slug: "cs-england-2-1-croatia",
    matchId: "m-l1",
    tipsterSlug: "jelena-stankovic",
    market: "Correct Score",
    prediction: "England 2 - 1 Croatia",
    shortReason: "England edge a tight one against an ageing Croatia — classic 2-1.",
    analysis:
      "England-Croatia at the World Cup has produced two prior 2-1 results. Modrić's set-piece delivery still threatens, but England's depth in midfield wears Croatia down. 2-1 at 9.00 has ~10% probability.",
    odds: odds(9.00, [0.50, 0.30, 0.00, 0.20, 0.40]),
    confidence: 2,
    status: "pending",
    isPremium: true,
    postedAtISO: "2026-05-15T11:30:00Z",
  },

  // ===== Nikola Đurić — Generalist (8 tips across markets) =====
  {
    id: "tip-029",
    slug: "ah-canada-bih",
    matchId: "m-b1",
    tipsterSlug: "nikola-djuric",
    market: "Asian Handicap",
    prediction: "Canada −0.5",
    shortReason: "Home opener for Canada in Toronto; BiH a level below.",
    analysis:
      "Canada have improved since 2022 and the home crowd at BMO Field is a real factor. BiH had to come through a tough play-off — they're tired. Canada −0.5 at 1.95 prices like a coin-flip but I have Canada at 56% to win outright.",
    odds: odds(1.95, [0.02, 0.04, 0.00, 0.03, 0.05]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-13T18:00:00Z",
  },
  {
    id: "tip-030",
    slug: "btts-no-france-iraq",
    matchId: "m-i4",
    tipsterSlug: "nikola-djuric",
    market: "BTTS",
    prediction: "Both teams to score: No",
    shortReason: "France clean sheets vs Asian opposition: 7 of last 9.",
    analysis:
      "France have been miserly against Asian opposition. Iraq qualified by being defensively solid, not by scoring (1.1 gpg in qualifying). BTTS no at 1.55 has a clear edge.",
    odds: odds(1.55, [0.05, 0.02, 0.00, 0.03, 0.04]),
    confidence: 4,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-14T18:00:00Z",
  },
  {
    id: "tip-031",
    slug: "1x2-uruguay-vs-saudi",
    matchId: "m-h2",
    tipsterSlug: "nikola-djuric",
    market: "1X2",
    prediction: "Uruguay to win",
    shortReason: "Bielsa's Uruguay are organised and physical; Saudi can't replicate Qatar magic.",
    analysis:
      "Saudi Arabia's win over Argentina in 2022 was a once-in-a-generation upset. Uruguay under Bielsa play with structure and intensity that suits the Texas heat. Take Uruguay at 1.62.",
    odds: odds(1.62, [0.00, 0.03, 0.05, 0.02, 0.04]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T08:45:00Z",
  },
  {
    id: "tip-032",
    slug: "ou-belgium-egypt",
    matchId: "m-g1",
    tipsterSlug: "nikola-djuric",
    market: "Over/Under 2.5",
    prediction: "Over 2.5 goals",
    shortReason: "De Bruyne free-kicks + Egypt's open play = goals.",
    analysis:
      "Belgium open against Egypt in Atlanta. Salah's Egypt are an attacking side and Belgium's De Bruyne is at his last World Cup. Over 2.5 at 1.85 is well-priced.",
    odds: odds(1.85, [0.02, 0.05, 0.00, 0.04, 0.03]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T09:30:00Z",
  },
  {
    id: "tip-033",
    slug: "1x2-bra-vs-haiti",
    matchId: "m-c4",
    tipsterSlug: "nikola-djuric",
    market: "1X2",
    prediction: "Brazil to win",
    shortReason: "Brazil at Lincoln Financial Field — favourites by a chasm.",
    analysis:
      "Haiti are debutants and Brazil should run up the score for goal difference. The price under 1.15 is short but the −2 handicap looks fair. Sticking to the result at 1.10.",
    odds: odds(1.10, [-0.01, 0.00, 0.02, 0.01, 0.03]),
    confidence: 5,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T10:30:00Z",
  },
  {
    id: "tip-034",
    slug: "ah-netherlands-tunisia",
    matchId: "m-f5",
    tipsterSlug: "nikola-djuric",
    market: "Asian Handicap",
    prediction: "Netherlands −1.5",
    shortReason: "Netherlands need a result on matchday 3 — go big or go home.",
    analysis:
      "By matchday 3 Netherlands will likely need to win and win comfortably for goal difference. Tunisia tend to fade in the final group game. Netherlands −1.5 at 2.10 has clear value.",
    odds: odds(2.10, [0.05, 0.02, 0.00, 0.04, 0.03]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T11:45:00Z",
  },
  {
    id: "tip-035",
    slug: "1x2-japan-sweden",
    matchId: "m-f6",
    tipsterSlug: "nikola-djuric",
    market: "1X2",
    prediction: "Japan to win",
    shortReason: "Japan's structured 4-3-3 outclasses an ageing Swedish midfield.",
    analysis:
      "Japan have beaten Germany and Spain in the last two World Cups. Sweden qualified through play-offs but lack a true No. 9 since Ibrahimović's retirement. Japan at 2.30 is a value win.",
    odds: odds(2.30, [0.05, 0.10, 0.00, 0.08, 0.04]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T13:00:00Z",
  },
  {
    id: "tip-036",
    slug: "ou-spain-uruguay",
    matchId: "m-h5",
    tipsterSlug: "nikola-djuric",
    market: "Over/Under 2.5",
    prediction: "Under 2.5 goals",
    shortReason: "Bielsa's Uruguay v Spain's possession game = chess match, low total.",
    analysis:
      "Both teams will likely have qualification on the line and play conservatively. Bielsa loves a 1-0 win. Spain comfortable controlling possession without taking risks. Under 2.5 at 2.00 is fair.",
    odds: odds(2.00, [0.04, 0.00, 0.05, 0.03, 0.02]),
    confidence: 3,
    status: "pending",
    isPremium: false,
    postedAtISO: "2026-05-15T14:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers / data accessors
// ---------------------------------------------------------------------------
export function getAllTips(): Tip[] {
  return tips;
}

export function getTipBySlug(slug: string): Tip | undefined {
  return tips.find((t) => t.slug === slug);
}

export function getTipsByTipster(tipsterSlug: string): Tip[] {
  return tips.filter((t) => t.tipsterSlug === tipsterSlug);
}

export function getTipsByMatch(matchId: string): Tip[] {
  return tips.filter((t) => t.matchId === matchId);
}

export function getAllTipsters(): Tipster[] {
  return tipsters;
}

export function getAllMatches(): Match[] {
  return matches;
}

export function getAllGroups(): GroupCode[] {
  return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
}

export function getAllMarkets(): TipMarket[] {
  return ["1X2", "Over/Under 2.5", "BTTS", "Asian Handicap", "Correct Score"];
}

export function getBookmakers(): Bookmaker[] {
  return bookmakers;
}

export function getBookmakerBySlug(slug: BookmakerSlug): Bookmaker | undefined {
  return bookmakers.find((b) => b.slug === slug);
}

export interface BestOdds {
  bookmaker: Bookmaker;
  value: number;
}

export function bestOddsForTip(tip: Tip): BestOdds {
  const best = tip.odds.reduce((acc, o) => (o.value > acc.value ? o : acc), tip.odds[0]);
  const bookmaker = getBookmakerBySlug(best.bookmaker)!;
  return { bookmaker, value: best.value };
}

// "Days until kickoff" helper used for the countdown chip on cards.
// Treats today as midnight UTC for stability across timezones.
export function daysUntilKickoff(kickoffISO: string, fromISO?: string): number {
  const now = fromISO ? new Date(fromISO) : new Date();
  const kickoff = new Date(kickoffISO);
  const ms = kickoff.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
