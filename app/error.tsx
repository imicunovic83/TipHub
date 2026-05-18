"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <section className="pad-section">
      <div className="container">
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <div className="empty-state-icon" aria-hidden="true">⚠️</div>
          <p className="empty-state-title">Something went wrong</p>
          <p className="empty-state-body">
            We hit a snag rendering this page. It may be a temporary issue — try again, or head back home.
            {error.digest ? (
              <>
                <br />
                <span className="text-muted-sm">Reference: {error.digest}</span>
              </>
            ) : null}
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: "1rem", gap: "0.5rem" }}>
            <button type="button" onClick={() => unstable_retry()} className="btn btn-primary">
              Try again
            </button>
            <Link href="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
