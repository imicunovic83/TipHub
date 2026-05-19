import type { MetadataRoute } from "next";
import { isStagingHost, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Staging (any *.vercel.app host) blocks everything so beta content
  // doesn't get indexed as a duplicate of the eventual tiphub.rs site.
  if (isStagingHost()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/auth/",
        "/tipster/apply",
        "/tipster/dashboard",
        "/profile",
        "/login",
        "/register",
        "/forgot",
        "/reset-password",
        "/search",
        "/newsletter/",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
