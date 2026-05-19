// Centralised site identity used by metadata, sitemap, robots, and OG image
// generators. Keep this in sync with the brand if/when it changes.

export const SITE_NAME = "TipHub";

export const SITE_TAGLINE =
  "Free tipster community with transparent track records";

export const SITE_DESCRIPTION =
  "Honest football tips from a community of tipsters — every win, miss and ROI on public record. Compare odds across 5 bookmakers on every pick. Free forever, no VIP groups, no paywalls.";

// Trim a trailing slash so we can safely concatenate paths.
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

// True on Vercel preview/production URLs (`*.vercel.app`) — we treat those as
// a staging environment so search engines don't index it as a duplicate of
// the eventual tiphub.rs production site. Production flips this to false by
// setting NEXT_PUBLIC_SITE_URL to https://tiphub.rs.
export function isStagingHost(): boolean {
  const url = siteUrl();
  return url.includes(".vercel.app");
}

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${p}`;
}
