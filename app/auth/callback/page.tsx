"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import SectionTitle from "@/components/SectionTitle";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Restoring authenticated session...");

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error || !data.session?.access_token) {
        setMessage("Unable to restore session. Please try logging in again.");
        return;
      }

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      router.replace("/profile");
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <SectionTitle
          eyebrow="Authenticating"
          title="Finalizing sign in"
          description="Please wait while we complete your login and redirect you to your profile."
        />

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <p>{message}</p>
        </div>
      </div>
    </section>
  );
}
