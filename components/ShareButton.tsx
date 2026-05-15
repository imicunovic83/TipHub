"use client";

import { useState } from "react";

export default function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in older browsers / insecure contexts.
      // Fall back to a manual prompt so the user can copy the URL.
      window.prompt("Copy the URL:", `${window.location.origin}${path}`);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={copied ? "share-button is-copied" : "share-button"}
      aria-live="polite"
    >
      {copied ? "✓ Copied!" : "🔗 Share tip"}
    </button>
  );
}
