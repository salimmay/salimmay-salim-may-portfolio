import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo";
import { ROUTABLE_TOOLS } from "./tools/registry";

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
    // One entry per browser tool. "png to ico" is a search someone makes; it
    // needs its own indexable page to land on.
    ...ROUTABLE_TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
