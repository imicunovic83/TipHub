// Fixed set of tipster specialties offered on the apply form. Shared by the
// client form and the apply API so a specialty can't be free-typed. No
// server-only imports — safe in a "use client" component.

export const TIPSTER_SPECIALTIES = [
  "1X2 specialist",
  "Over/Under goals",
  "Both Teams to Score",
  "Asian Handicap",
  "Correct Score",
  "Player props & scorers",
  "In-play / live betting",
  "Accumulators",
  "Statistical models",
  "Generalist",
] as const;

export type TipsterSpecialty = (typeof TIPSTER_SPECIALTIES)[number];

export function isValidSpecialty(value: string): value is TipsterSpecialty {
  return (TIPSTER_SPECIALTIES as readonly string[]).includes(value);
}
