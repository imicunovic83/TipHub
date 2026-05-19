import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import CookieConsent from "@/components/CookieConsent";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, isStagingHost, siteUrl } from "@/lib/site";

const STAGING = isStagingHost();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: STAGING
      ? `[Beta] ${SITE_NAME} — ${SITE_TAGLINE}`
      : `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: STAGING ? `[Beta] %s | ${SITE_NAME}` : `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "football tips",
    "World Cup 2026 predictions",
    "sports betting community",
    "bookmaker odds comparison",
    "Mozzart",
    "Maxbet",
    "Soccerbet",
    "Meridian",
    "AdmiralBet",
    "tipster track record",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} blog` }],
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: STAGING ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="layout">
        {STAGING ? (
          <div className="staging-banner" role="note">
            <span className="staging-banner-pill">BETA</span>
            <span>
              You&apos;re on a public beta of TipHub. Some content is sample data — bug reports welcome.
            </span>
          </div>
        ) : null}
        <Header />
        <main className="layout-main">{children}</main>
        <Footer />
        <BetSlip />
        <CookieConsent />
      </body>
    </html>
  );
}
