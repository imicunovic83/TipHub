"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    favoriteTipster: "",
    terms: false,
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setStatus({ type: "error", message: "Please complete all required fields." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (!form.terms) {
      setStatus({ type: "error", message: "You must agree to the terms to continue." });
      return;
    }

    setLoading(true);

    trackEvent('register_attempt', { email: form.email });

    const supabase = getSupabaseClient();
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: fullName,
          favorite_tipster: form.favoriteTipster || null,
        },
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message || "Registration failed." });
    } else {
      // Profile row is created automatically by the `on_auth_user_created`
      // trigger that reads full_name / favorite_tipster from user_metadata.

      if (data.session?.access_token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
      }

      setStatus({
        type: "success",
        message: data.user
          ? "Account created successfully. Check your email to confirm your account."
          : "Check your email to complete registration.",
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        favoriteTipster: "",
        terms: false,
      });
      router.push("/");
    }

    setLoading(false);
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="row" style={{ gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <label htmlFor="first-name" className="field-label">
            First name
          </label>
          <input
            id="first-name"
            name="firstName"
            type="text"
            className="input"
            value={form.firstName}
            onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            placeholder="Ana"
            required
          />
        </div>
        <div style={{ flex: "1 1 240px" }}>
          <label htmlFor="last-name" className="field-label">
            Last name
          </label>
          <input
            id="last-name"
            name="lastName"
            type="text"
            className="input"
            value={form.lastName}
            onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            placeholder="Petrović"
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="row" style={{ gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Enter a secure password"
            required
            minLength={8}
          />
        </div>
        <div style={{ flex: "1 1 240px" }}>
          <label htmlFor="confirm-password" className="field-label">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            className="input"
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            placeholder="Repeat your password"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="tipster" className="field-label">
          Favorite tipster (optional)
        </label>
        <select
          id="tipster"
          name="favoriteTipster"
          className="select"
          value={form.favoriteTipster}
          onChange={(event) => setForm({ ...form, favoriteTipster: event.target.value })}
        >
          <option value="">None selected</option>
          <option value="marko">Marko</option>
          <option value="jelena">Jelena</option>
          <option value="stefan">Stefan</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="terms" className="field-label">
          Terms and privacy
        </label>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={form.terms}
            onChange={(event) => setForm({ ...form, terms: event.target.checked })}
            required
          />
          <label htmlFor="terms" style={{ margin: 0 }}>
            I agree to TipHub&apos;s terms of service and privacy policy.
          </label>
        </div>
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading || !form.terms}>
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
