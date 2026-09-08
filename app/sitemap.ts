import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo";

// Two routes: the portfolio and the tools page. They target different searches,
// so both need to be discoverable on their own.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
