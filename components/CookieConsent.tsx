"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "tiphub-consent";

type Consent = "accepted" | "declined";

export function getStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

function setStoredConsent(value: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event("tiphub-consent-change"));
  } catch {
    // localStorage blocked — show banner every visit
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    setStoredConsent("accepted");
    setVisible(false);
  }

  function decline() {
    setStoredConsent("declined");
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-inner">
        <p className="cookie-banner-copy">
          TipHub uses a session cookie for login and an analytics cookie to
          count page views — no third-party trackers. See our{" "}
          <Link href="/privacy" className="text-link">privacy policy</Link> for details.
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="btn btn-ghost cookie-banner-btn" onClick={decline}>
            Decline analytics
          </button>
          <button type="button" className="btn btn-primary cookie-banner-btn" onClick={accept}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
