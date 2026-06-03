import { NextResponse } from "next/server";
import { deleteOwnTip, updateOwnTip, type TipMarket } from "@/lib/tipster-tips";
import { bookmakers, getMatchById } from "@/lib/data";
import { getAccessTokenFromRequest, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { deriveBookmakerOdds, isValidPrediction } from "@/lib/competition-markets";

const ALLOWED_MARKETS: TipMarket[] = ["1X2", "Over/Under 2.5", "BTTS", "Asian Handicap", "Correct Score"];

async function requireTipsterUser(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return null;
  const user = await getSupabaseUserFromToken(token);
  if (!user) return null;
  const role = user.user_metadata?.role;
  if (role !== "tipster" && role !== "admin") return null;
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireTipsterUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const patch: Parameters<typeof updateOwnTip>[2] = {};

  if (typeof body.matchId === "string") {
    if (!getMatchById(body.matchId)) {
      return NextResponse.json({ error: "Pick a valid match." }, { status: 400 });
    }
    patch.matchId = body.matchId;
  }
  if (typeof body.market === "string") {
    if (!ALLOWED_MARKETS.includes(body.market as TipMarket)) {
      return NextResponse.json({ error: "Pick a valid market." }, { status: 400 });
    }
    patch.market = body.market as TipMarket;
  }
  if (typeof body.prediction === "string") {
    if (!body.prediction.trim()) return NextResponse.json({ error: "Prediction is required." }, { status: 400 });
    // Prediction must match the market that's now in effect (either patched
    // or, if not changed, whatever the row already has — client sends both).
    const marketForCheck = patch.market ?? (body.market as TipMarket | undefined);
    if (marketForCheck && !isValidPrediction(marketForCheck, body.prediction.trim())) {
      return NextResponse.json(
        { error: "Pick one of the offered predictions for that market." },
        { status: 400 },
      );
    }
    patch.prediction = body.prediction.trim();
  }
  if (typeof body.shortReason === "string") {
    if (!body.shortReason.trim()) return NextResponse.json({ error: "A short reason is required." }, { status: 400 });
    patch.shortReason = body.shortReason;
  }
  if (typeof body.analysis === "string") patch.analysis = body.analysis;
  if (typeof body.oddsBookmaker === "string") {
    if (!bookmakers.some((b) => b.slug === body.oddsBookmaker)) {
      return NextResponse.json({ error: "Pick a known bookmaker." }, { status: 400 });
    }
    patch.oddsBookmaker = body.oddsBookmaker;
  }
  if (body.confidence !== undefined) {
    const c = Number(body.confidence);
    if (![1, 2, 3, 4, 5].includes(c)) {
      return NextResponse.json({ error: "Confidence must be between 1 and 5." }, { status: 400 });
    }
    patch.confidence = c as 1 | 2 | 3 | 4 | 5;
  }

  // Re-derive odds whenever the selection inputs land in this patch. The
  // OwnTipsList edit form always sends all four (matchId, market, prediction,
  // oddsBookmaker), so this covers the inline-edit case. Any client-sent
  // oddsValue is intentionally ignored.
  const affectsOdds =
    patch.matchId !== undefined ||
    patch.market !== undefined ||
    patch.prediction !== undefined ||
    patch.oddsBookmaker !== undefined;
  if (affectsOdds) {
    const mId = patch.matchId ?? (typeof body.matchId === "string" ? body.matchId : "");
    const mk = patch.market ?? (typeof body.market === "string" ? (body.market as TipMarket) : undefined);
    const pr = patch.prediction ?? (typeof body.prediction === "string" ? body.prediction : "");
    const bk = patch.oddsBookmaker ?? (typeof body.oddsBookmaker === "string" ? body.oddsBookmaker : "");
    if (mId && mk && pr && bk) {
      patch.oddsValue = deriveBookmakerOdds(mId, mk, pr, bk);
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await updateOwnTip(id, user.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Tip not found, not yours, or already resolved." }, { status: 404 });
  }
  return NextResponse.json({ success: true, tip: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireTipsterUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ok = await deleteOwnTip(id, user.id);
  if (!ok) {
    return NextResponse.json({ error: "Tip not found, not yours, or already resolved." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
