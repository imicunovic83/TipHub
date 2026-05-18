import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getMergedTips, getMergedTipsters } from "@/lib/merged-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,            lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${base}/tips`,        lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/tipsters`,    lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/bookmakers`,  lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/competition`, lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const [tipsters, tips] = await Promise.all([getMergedTipsters(), getMergedTips()]);

  const tipsterRoutes: MetadataRoute.Sitemap = tipsters.map((t) => ({
    url: `${base}/tipsters/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: t.isDemo ? 0.3 : 0.7,
  }));

  const tipRoutes: MetadataRoute.Sitemap = tips.map((tip) => ({
    url: `${base}/tips/${tip.slug}`,
    lastModified: new Date(tip.postedAtISO),
    changeFrequency: "daily",
    priority: tip.isDemo ? 0.3 : 0.6,
  }));

  return [...staticRoutes, ...tipsterRoutes, ...tipRoutes];
}
