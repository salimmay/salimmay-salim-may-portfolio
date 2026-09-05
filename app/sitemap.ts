import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo";

// Single-page site, so this is one entry. It exists because a sitemap is how
// you hand Search Console a lastModified signal and confirm the canonical URL.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
