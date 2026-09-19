import { getAllPostsMeta, SITE_URL } from "@/lib/blog";
import { MIN_SUBMISSIONS_FOR_INDEX } from "@/lib/constants";
import { COUNTRIES, PROFESSIONS, toSlug } from "@/lib/slugs";
import { fetchAllPairCounts } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

// Re-aggregate submission counts at most once an hour — this walks the
// whole salary_entries table (see fetchAllPairCounts), no need to redo it
// on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Only list country×profession pages that actually have enough real
  // submissions to be worth indexing (see MIN_SUBMISSIONS_FOR_INDEX). This
  // was ~1,960 unconditional combinatorial URLs before; most had 0 real
  // submissions, which is why GSC piled up ~1,900 "Discovered – currently
  // not indexed" pages. The excluded pairs still exist and render (users
  // can still land on them and submit data) — they're just not pushed at
  // Google via the sitemap, and carry a noindex meta tag (see
  // app/[country]/[profession]/page.tsx generateMetadata).
  const pairCounts = await fetchAllPairCounts();
  const countryProfessionPages = COUNTRIES.flatMap((c) =>
    PROFESSIONS.filter((p) => (pairCounts.get(`${c}|${p}`) ?? 0) >= MIN_SUBMISSIONS_FOR_INDEX).map((p) => ({
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
