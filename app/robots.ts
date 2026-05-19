import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
