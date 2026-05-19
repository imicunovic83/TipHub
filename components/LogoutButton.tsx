"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export default function LogoutButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "err">("idle");

  async function handleLogout() {
    if (state === "working") return;
    setState("working");
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      trackEvent("logout", {});
      router.push("/login");
    } catch (e) {
      trackEvent("logout_failed", { error: String(e) });
      setState("err");
    }
  }

  return (
    <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleLogout}
        className="btn btn-logout"
        disabled={state === "working"}
        aria-label="Log out"
      >
        <svg
          className="btn-logout-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{state === "working" ? "Logging out…" : "Log out"}</span>
      </button>
      {state === "err" ? (
        <span className="form-msg form-msg--err" role="alert">Logout failed. Try again.</span>
      ) : null}
    </div>
  );
}
