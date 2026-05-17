"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function TipsterApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState({ specialty: "", bio: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!form.specialty.trim() || !form.bio.trim()) {
      setStatus({ type: "error", message: "Please describe your specialty and why you want to be a tipster." });
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setStatus({ type: "error", message: "Your session expired. Please log in again." });
      setLoading(false);
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
    const data = await response.json();

    if (!response.ok) {
      setStatus({ type: "error", message: data.error || "Application submission failed." });
    } else {
      setStatus({ type: "success", message: "Application sent. An admin will review your profile soon." });
      setForm({ specialty: "", bio: "" });
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form className="panel stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="specialty" className="field-label">
          Tipster specialty
        </label>
        <input
          id="specialty"
          className="input"
          value={form.specialty}
          onChange={(event) => setForm({ ...form, specialty: event.target.value })}
          placeholder="Match winner predictions, in-play betting, stats analysis"
          required
        />
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
