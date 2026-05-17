import {
  bookmakers,
  getAllTips,
  getAllTipsters,
  getTipBySlug,
  getTipsterBySlug,
  type BookmakerSlug,
  type Tip,
  type TipMarket,
  type Tipster,
} from "@/lib/data";
import {
  getAllTipsterProfiles,
  getTipsterProfileBySlug,
  type TipsterProfile,
} from "@/lib/tipster-profiles";
import {
  getAllUserTips,
  getTipsForTipster,
  getUserTipById,
  type UserTip,
} from "@/lib/tipster-tips";

function bookmakerSlugIfKnown(slug: string): BookmakerSlug {
  const known = bookmakers.find((b) => b.slug === slug);
  return (known?.slug ?? bookmakers[0].slug) as BookmakerSlug;
}

function userTipToTip(tip: UserTip, tipsterSlug: string): Tip {
  return {
    id: tip.id,
    slug: tip.id,
    matchId: tip.matchId,
    tipsterSlug,
    market: tip.market as TipMarket,
    prediction: tip.prediction,
    shortReason: tip.shortReason,
    analysis: tip.analysis ?? "",
    odds: [{ bookmaker: bookmakerSlugIfKnown(tip.oddsBookmaker), value: tip.oddsValue }],
    confidence: tip.confidence,
    status: tip.status,
    isPremium: tip.isPremium,
    postedAtISO: tip.postedAt,
  };
}

function profileToTipster(profile: TipsterProfile, tips: UserTip[]): Tipster {
  const resolved = tips.filter((t) => t.status !== "pending");
  const wins = resolved.filter((t) => t.status === "won").length;
  const winRate = resolved.length ? Math.round((wins / resolved.length) * 100) : 0;
  const totalReturn = resolved.reduce((sum, t) => sum + (t.status === "won" ? t.oddsValue : 0), 0);
  const totalStaked = resolved.length;
  const roi = totalStaked ? Number((((totalReturn - totalStaked) / totalStaked) * 100).toFixed(1)) : 0;

  // Longest consecutive-wins streak in chronological order
  const chronological = [...resolved].sort(
    (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime(),
  );
  let current = 0;
  let bestStreak = 0;
  for (const t of chronological) {
    if (t.status === "won") {
      current += 1;
      if (current > bestStreak) bestStreak = current;
    } else {
      current = 0;
    }
  }

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "T";

  return {
    id: profile.userId,
    slug: profile.slug,
    name: profile.name,
    specialty: profile.specialty,
    shortBio: profile.shortBio,
    longBio: profile.longBio,
    initials,
    gender: "male",
    winRate,
    roi,
    totalTips: tips.length,
    bestStreak,
    joinedYear: new Date(profile.joinedAt).getUTCFullYear(),
    isHot: false,
  };
}

function groupTipsByUser(tips: UserTip[]): Map<string, UserTip[]> {
  const map = new Map<string, UserTip[]>();
  for (const tip of tips) {
    const list = map.get(tip.tipsterUserId);
    if (list) list.push(tip);
    else map.set(tip.tipsterUserId, [tip]);
  }
  return map;
}

export async function getMergedTipsters(): Promise<Tipster[]> {
  const seed = getAllTipsters();
  const [profiles, allUserTips] = await Promise.all([getAllTipsterProfiles(), getAllUserTips()]);
  const tipsByUser = groupTipsByUser(allUserTips);
  const dbTipsters = profiles.map((p) => profileToTipster(p, tipsByUser.get(p.userId) ?? []));
  return [...seed, ...dbTipsters];
}

export async function getMergedTipsterBySlug(slug: string): Promise<Tipster | undefined> {
  const seed = getTipsterBySlug(slug);
  if (seed) return seed;
  const profile = await getTipsterProfileBySlug(slug);
  if (!profile) return undefined;
  const tips = await getTipsForTipster(profile.userId);
  return profileToTipster(profile, tips);
}

export async function getMergedTips(): Promise<Tip[]> {
  const seed = getAllTips();
  const [profiles, allUserTips] = await Promise.all([getAllTipsterProfiles(), getAllUserTips()]);
  const slugByUserId = new Map(profiles.map((p) => [p.userId, p.slug]));

  // Drop orphan tips whose tipster has no profile.
  const dbTips = allUserTips
    .map((t) => {
      const slug = slugByUserId.get(t.tipsterUserId);
      if (!slug) return null;
      return userTipToTip(t, slug);
    })
    .filter((t): t is Tip => t !== null);

  return [...seed, ...dbTips];
}

export async function getMergedTipsByTipster(tipsterSlug: string): Promise<Tip[]> {
  const all = await getMergedTips();
  return all.filter((t) => t.tipsterSlug === tipsterSlug);
}

export async function getMergedTipBySlug(slug: string): Promise<Tip | undefined> {
  const seed = getTipBySlug(slug);
  if (seed) return seed;

  const userTip = await getUserTipById(slug);
  if (!userTip) return undefined;

  const profile = await getAllTipsterProfiles().then((profiles) =>
    profiles.find((p) => p.userId === userTip.tipsterUserId),
  );
  if (!profile) return undefined;

  return userTipToTip(userTip, profile.slug);
}
