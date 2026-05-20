"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { TIPSTER_SPECIALTIES } from "@/lib/tipster-specialties";

export default function TipsterApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState({ specialty: TIPSTER_SPECIALTIES[0] as string, bio: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!form.specialty.trim() || !form.bio.trim()) {
      setStatus({ type: "error", message: "Please pick a specialty and tell us why you want to be a tipster." });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setStatus({ type: "error", message: "Your session expired. Please log in again." });
        return;
      }

      const response = await fetch("/api/auth/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      let data: { error?: string } = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response (e.g. an unexpected server error page).
      }

      if (!response.ok) {
        setStatus({ type: "error", message: data.error || `Application failed (${response.status}). Please try again.` });
      } else {
        setStatus({ type: "success", message: "Application sent. An admin will review your profile soon." });
        setForm({ specialty: TIPSTER_SPECIALTIES[0] as string, bio: "" });
        router.refresh();
      }
    } catch {
      setStatus({ type: "error", message: "Network error — your application wasn't sent. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="specialty" className="field-label">
          Tipster specialty
        </label>
        <select
          id="specialty"
          className="select"
          value={form.specialty}
          onChange={(event) => setForm({ ...form, specialty: event.target.value })}
          required
        >
          {TIPSTER_SPECIALTIES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="bio" className="field-label">
          Tell us about yourself
        </label>
        <textarea
          id="bio"
          className="input"
          value={form.bio}
          onChange={(event) => setForm({ ...form, bio: event.target.value })}
          placeholder="Share your experience, who you follow, and why you make great predictions."
          rows={6}
          required
        />
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Sending application…" : "Submit application"}
      </button>
    </form>
  );
}
