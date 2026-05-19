import { randomUUID } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type NewsletterStatus = "pending" | "confirmed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  token: string;
  createdAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
}

type Row = {
  id: string;
  email: string;
  status: NewsletterStatus;
  token: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
};

function rowToSubscriber(row: Row): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    token: row.token,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? undefined,
    unsubscribedAt: row.unsubscribed_at ?? undefined,
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export type SubscribeOutcome =
  | { kind: "created"; subscriber: NewsletterSubscriber }
  | { kind: "resent"; subscriber: NewsletterSubscriber }
  | { kind: "already_confirmed"; subscriber: NewsletterSubscriber };

// Idempotent: a pending row gets its confirmation email re-sent (with a fresh
// token), an unsubscribed row gets reactivated to pending, a confirmed row
// short-circuits so we don't pretend to "subscribe" them again.
export async function subscribeEmail(email: string): Promise<SubscribeOutcome> {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseServerClient();

  const existing = await supabase
    .from("newsletter_subscribers")
    .select()
    .eq("email", normalized)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`Failed to look up subscriber: ${existing.error.message}`);
  }

  if (existing.data) {
    const row = existing.data as Row;
    if (row.status === "confirmed") {
      return { kind: "already_confirmed", subscriber: rowToSubscriber(row) };
    }
    const updated = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "pending",
        token: randomUUID(),
        unsubscribed_at: null,
      })
      .eq("id", row.id)
      .select()
      .single();
    if (updated.error || !updated.data) {
      throw new Error(`Failed to refresh subscriber: ${updated.error?.message ?? "no row"}`);
    }
    return { kind: "resent", subscriber: rowToSubscriber(updated.data as Row) };
  }

  const inserted = await supabase
    .from("newsletter_subscribers")
    .insert({ email: normalized, token: randomUUID() })
    .select()
    .single();
  if (inserted.error || !inserted.data) {
    throw new Error(`Failed to create subscriber: ${inserted.error?.message ?? "no row"}`);
  }
  return { kind: "created", subscriber: rowToSubscriber(inserted.data as Row) };
}

export type ConfirmOutcome =
  | { kind: "confirmed"; subscriber: NewsletterSubscriber }
  | { kind: "already_confirmed"; subscriber: NewsletterSubscriber }
  | { kind: "invalid_token" };

export async function confirmByToken(token: string): Promise<ConfirmOutcome> {
  const supabase = getSupabaseServerClient();
  const lookup = await supabase
    .from("newsletter_subscribers")
    .select()
    .eq("token", token)
    .maybeSingle();
  if (lookup.error) throw new Error(`Confirm lookup failed: ${lookup.error.message}`);
  if (!lookup.data) return { kind: "invalid_token" };

  const row = lookup.data as Row;
  if (row.status === "confirmed") {
    return { kind: "already_confirmed", subscriber: rowToSubscriber(row) };
  }

  const updated = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .eq("id", row.id)
    .select()
    .single();
  if (updated.error || !updated.data) {
    throw new Error(`Confirm update failed: ${updated.error?.message ?? "no row"}`);
  }
  return { kind: "confirmed", subscriber: rowToSubscriber(updated.data as Row) };
}

export type UnsubscribeOutcome =
  | { kind: "unsubscribed"; subscriber: NewsletterSubscriber }
  | { kind: "already_unsubscribed"; subscriber: NewsletterSubscriber }
  | { kind: "invalid_token" };

export async function unsubscribeByToken(token: string): Promise<UnsubscribeOutcome> {
  const supabase = getSupabaseServerClient();
  const lookup = await supabase
    .from("newsletter_subscribers")
    .select()
    .eq("token", token)
    .maybeSingle();
  if (lookup.error) throw new Error(`Unsubscribe lookup failed: ${lookup.error.message}`);
  if (!lookup.data) return { kind: "invalid_token" };

  const row = lookup.data as Row;
  if (row.status === "unsubscribed") {
    return { kind: "already_unsubscribed", subscriber: rowToSubscriber(row) };
  }

  const updated = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select()
    .single();
  if (updated.error || !updated.data) {
    throw new Error(`Unsubscribe update failed: ${updated.error?.message ?? "no row"}`);
  }
  return { kind: "unsubscribed", subscriber: rowToSubscriber(updated.data as Row) };
}
