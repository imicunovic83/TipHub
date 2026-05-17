"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

type Stage = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    // Supabase JS auto-detects the recovery tokens in `window.location.hash`
    // and emits a `PASSWORD_RECOVERY` event. We arm the form when that fires.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setStage("ready");
      }
    });

    // If the user reloads or visits without a recovery hash, the event won't
    // fire — fall back to a session check after a short delay.
    const fallback = window.setTimeout(async () => {
      if (!mounted || stage !== "checking") return;
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setStage(data.session ? "ready" : "invalid");
    }, 800);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    trackEvent("reset_password_submit");

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: "error", message: error.message || "Unable to update password." });
      setLoading(false);
      return;
    }

    setStage("done");
    setStatus({ type: "success", message: "Password updated. Redirecting to login…" });
    // Drop the recovery session so the user has to sign in with the new password.
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 1500);
  }

  if (stage === "checking") {
    return <p className="text-muted-sm">Verifying reset link…</p>;
  }

  if (stage === "invalid") {
    return (
      <div className="stack">
        <p>
          This page needs a valid password-reset link. Request a new one from{" "}
          <Link href="/forgot" className="text-link">the forgot-password page</Link>.
        </p>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="new-password" className="field-label">New password</label>
        <input
          id="new-password"
          type="password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          disabled={loading || stage === "done"}
          autoComplete="new-password"
        />
      </div>

      <div className="field">
        <label htmlFor="confirm-password" className="field-label">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          className="input"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          minLength={8}
          required
          disabled={loading || stage === "done"}
          autoComplete="new-password"
        />
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading || stage === "done"}>
        {loading ? "Updating…" : stage === "done" ? "Updated" : "Update password"}
      </button>
    </form>
  );
}
