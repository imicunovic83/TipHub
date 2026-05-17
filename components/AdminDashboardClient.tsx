"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TipsterApplication {
  id: string;
  userId: string;
  specialty: string;
  bio: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  note?: string;
}

interface CompetitionSubmission {
  id: string;
  userId: string;
  matchId: string;
  market: string;
  prediction: string;
  odds: number;
  stake: number;
  status: string;
  resultAmount: number;
  createdAt: string;
}

interface PendingTip {
  id: string;
  tipsterName: string;
  matchId: string;
  market: string;
  prediction: string;
  oddsValue: number;
  oddsBookmaker: string;
  shortReason: string;
  postedAt: string;
}

export default function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingApplications, setPendingApplications] = useState<TipsterApplication[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<CompetitionSubmission[]>([]);
  const [pendingTips, setPendingTips] = useState<PendingTip[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const router = useRouter();

  useEffect(() => {
    // check admin user first
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = userData.user ?? null;
        const token = sessionData.session?.access_token;
        if (!user || user.user_metadata?.role !== "admin" || !token) {
          router.push("/login");
          return;
        }
        await fetchAdminData(token);
      } catch (e) {
        setError("Unable to verify admin status.");
      }
    })();
  }, [router]);

  async function fetchAdminData(token: string) {
    if (!token) {
      setError("Missing authentication token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to load admin data.");
      setLoading(false);
      return;
    }

    setPendingApplications(data.pendingApplications || []);
    setPendingSubmissions(data.pendingSubmissions || []);
    setPendingTips(data.pendingTips || []);
    setLoading(false);
  }

  async function handleAction(action: string, payload: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const responseData = await response.json();

    if (!response.ok) {
      setError(responseData.error || "Failed to complete action.");
    } else {
      setMessage("Action completed successfully.");
      await fetchAdminData(token ?? "");
    }

    setLoading(false);
  }

  return (
    <div className="stack">
      <div className="panel">
        <h3 className="title-section">Admin dashboard</h3>
        <p>Approve or reject tipster applications and resolve pending competition submissions.</p>
      </div>

      {message ? <div className="badge badge--pitch">{message}</div> : null}
      {error ? <div className="badge badge--rose">{error}</div> : null}

      {loading ? (
        <div className="panel">Loading admin data…</div>
      ) : (
        <>
          <div className="panel">
            <h4 className="title-section">Pending tipster applications</h4>
            {pendingApplications.length === 0 ? (
              <p>No applications are waiting for review.</p>
            ) : (
              <div className="stack">
                {pendingApplications.map((application) => {
                  const note = notes[application.id] ?? "";
                  return (
                    <div key={application.id} className="panel">
                      <div className="stack">
                        <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <strong>{application.specialty}</strong>
                            <p className="text-muted-sm">Submitted {new Date(application.submittedAt).toLocaleString()}</p>
                          </div>
                          <div className="row" style={{ gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() =>
                                handleAction("approve-application", {
                                  applicationId: application.id,
                                  note: note.trim() || undefined,
                                })
                              }
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                handleAction("reject-application", {
                                  applicationId: application.id,
                                  note: note.trim() || undefined,
                                })
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <p>{application.bio}</p>
                        <div className="field">
                          <label htmlFor={`note-${application.id}`} className="field-label">
                            Reviewer note (optional)
                          </label>
                          <textarea
                            id={`note-${application.id}`}
                            className="input"
                            rows={2}
                            placeholder="Visible to the applicant if rejected"
                            value={note}
                            onChange={(event) =>
                              setNotes((prev) => ({ ...prev, [application.id]: event.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel">
            <h4 className="title-section">Pending tipster tips</h4>
            {pendingTips.length === 0 ? (
              <p>No tipster tips are waiting for resolution.</p>
            ) : (
              <div className="stack">
                {pendingTips.map((tip) => (
                  <div key={tip.id} className="panel">
                    <div className="stack">
                      <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <strong>{tip.tipsterName}</strong> · <span className="text-muted-sm">{tip.market}</span>
                          <p className="text-muted-sm">
                            {tip.matchId} · {tip.oddsBookmaker} @ {tip.oddsValue} ·
                            posted {new Date(tip.postedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="row" style={{ gap: "0.5rem" }}>
                          <button type="button" className="btn btn-primary" onClick={() => handleAction("resolve-tip", { tipId: tip.id, status: "won" })}>
                            Mark won
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => handleAction("resolve-tip", { tipId: tip.id, status: "lost" })}>
                            Mark lost
                          </button>
                        </div>
                      </div>
                      <p><strong>{tip.prediction}</strong> — {tip.shortReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h4 className="title-section">Pending competition submissions</h4>
            {pendingSubmissions.length === 0 ? (
              <p>No competition submissions are waiting for resolution.</p>
            ) : (
              <div className="stack">
                {pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="panel">
                    <div className="stack">
                      <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <strong>{submission.market}</strong>
                          <p className="text-muted-sm">Submitted {new Date(submission.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="row" style={{ gap: "0.5rem" }}>
                          <button type="button" className="btn btn-primary" onClick={() => handleAction("resolve-submission", { submissionId: submission.id, status: "won" })}>
                            Mark won
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => handleAction("resolve-submission", { submissionId: submission.id, status: "lost" })}>
                            Mark lost
                          </button>
                        </div>
                      </div>
                      <p>{submission.prediction}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
