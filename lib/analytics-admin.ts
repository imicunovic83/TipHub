import { getSupabaseServerClient } from "@/lib/supabase-server";

const DAYS = 7;

type EventRow = {
  id: number;
  name: string;
  variant: string | null;
  payload: Record<string, unknown> | null;
  ts: string;
};

export interface AnalyticsSummary {
  totalEvents: number;
  uniqueEventNames: number;
  byName: Array<{ name: string; count: number }>;
  byVariant: Array<{ variant: string; count: number }>;
  recent: Array<{ id: number; name: string; variant: string; ts: string }>;
  rangeStartISO: string;
  rangeEndISO: string;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = getSupabaseServerClient();

  const end = new Date();
  const start = new Date(end.getTime() - DAYS * 24 * 60 * 60 * 1000);
  const rangeStartISO = start.toISOString();
  const rangeEndISO = end.toISOString();

  // Fetch the window in one query — events table is unlikely to be huge for
  // a single week, and aggregation in-memory keeps SQL simple.
  const { data, error } = await supabase
    .from("analytics_events")
    .select("id,name,variant,ts")
    .gte("ts", rangeStartISO)
    .order("ts", { ascending: false })
    .limit(5000);

  if (error) {
    throw new Error(`Load analytics events failed: ${error.message}`);
  }

  const rows = (data ?? []) as Array<Pick<EventRow, "id" | "name" | "variant" | "ts">>;

  const nameCounts = new Map<string, number>();
  const variantCounts = new Map<string, number>();
  for (const row of rows) {
    nameCounts.set(row.name, (nameCounts.get(row.name) ?? 0) + 1);
    const v = row.variant ?? "—";
    variantCounts.set(v, (variantCounts.get(v) ?? 0) + 1);
  }

  const byName = Array.from(nameCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const byVariant = Array.from(variantCounts.entries())
    .map(([variant, count]) => ({ variant, count }))
    .sort((a, b) => b.count - a.count);

  const recent = rows.slice(0, 25).map((row) => ({
    id: row.id,
    name: row.name,
    variant: row.variant ?? "—",
    ts: row.ts,
  }));

  return {
    totalEvents: rows.length,
    uniqueEventNames: nameCounts.size,
    byName,
    byVariant,
    recent,
    rangeStartISO,
    rangeEndISO,
  };
}
