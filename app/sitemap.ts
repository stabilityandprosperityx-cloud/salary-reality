import { getAllPostsMeta, SITE_URL } from "@/lib/blog";
import { COUNTRIES, PROFESSIONS, toSlug } from "@/lib/slugs";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
  const countryPages = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/${toSlug(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));
  const countryProfessionPages = COUNTRIES.flatMap((c) =>
    PROFESSIONS.map((p) => ({
      url: `${SITE_URL}/${toSlug(c)}/${toSlug(p)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...countryPages,
    ...countryProfessionPages,
    ...posts,
  ];
}
