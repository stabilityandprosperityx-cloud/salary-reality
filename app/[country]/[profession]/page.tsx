import Link from "next/link";
import type { Metadata } from "next";
import { countryFlagEmoji } from "@/lib/flags";
import { SITE_URL } from "@/lib/blog";
import { formatUsd, makeDashboardData } from "@/lib/salary";
import { COUNTRIES, PROFESSIONS, fromSlug, toSlug } from "@/lib/slugs";
import {
  SALARY_STATS_FETCH_LIMIT,
  fetchFilteredEntriesForStats,
  fetchFilteredEntriesPage,
  fetchFilteredEntryCount,
} from "@/lib/supabase/server";

type Props = {
  params: { country: string; profession: string };
};

const EMPLOYMENT_CHART_COLORS: Record<string, string> = {
  Remote: "#38BDF8",
  Local: "#22d3ee",
  Hybrid: "#a78bfa",
};

export const revalidate = 3600;

function resolveProfessionFromSlug(slug: string): string {
  const direct = PROFESSIONS.find((p) => toSlug(p) === slug);
  if (direct) return direct;
  return fromSlug(slug);
}

export function generateStaticParams() {
  return COUNTRIES.flatMap((country) =>
    PROFESSIONS.map((profession) => ({
      country: toSlug(country),
      profession: toSlug(profession),
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countryName = fromSlug(params.country);
  const professionName = resolveProfessionFromSlug(params.profession);
  const title = `${professionName} Salaries in ${countryName}: Real Data | Salary Reality`;
  const description = `See real anonymous ${professionName} salaries in ${countryName}. Median pay, salary range, and breakdowns by experience level and employment type.`;
  const canonical = `${SITE_URL}/${params.country}/${params.profession}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CountryProfessionPage({ params }: Props) {
  const countryName = fromSlug(params.country);
  const professionName = resolveProfessionFromSlug(params.profession);

  const [count, entries, latest] = await Promise.all([
    fetchFilteredEntryCount("", countryName, professionName),
    fetchFilteredEntriesForStats("", countryName, professionName, SALARY_STATS_FETCH_LIMIT),
    fetchFilteredEntriesPage("", countryName, professionName, 1, 25),
  ]);
  const stats = makeDashboardData(entries, entries, { scopeTotalExact: count, filteredCountExact: count });
  const maxExpMedian = Math.max(
    ...stats.medianByExperience.filter((r) => r.count > 0).map((r) => r.median),
    1,
  );
  const maxEmployment = Math.max(...stats.employmentDistribution.map((i) => i.count), 1);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-[#38BDF8] hover:text-[#7DD3FC]">
          ← All countries
        </Link>
        <Link href={`/${params.country}`} className="text-[#38BDF8] hover:text-[#7DD3FC]">
          ← {countryName}
        </Link>
      </div>

      <section className="glass p-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          {professionName} Salaries in {countryName}
        </h1>
        <p className="mt-2 text-white/70">Based on {count} anonymously submitted salaries</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass p-4">
          <p className="text-sm text-white/60">Median Salary</p>
          <p className="text-3xl font-semibold text-[#38BDF8]">{formatUsd(stats.filteredMedianSalary)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Salary Range</p>
          <p className="text-2xl font-semibold text-white">
            {formatUsd(stats.filteredMinSalary)} - {formatUsd(stats.filteredMaxSalary)}
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Total Submissions</p>
          <p className="text-2xl font-semibold text-white">{stats.filteredCount}</p>
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">By Experience Level</h2>
        <div className="space-y-3">
          {stats.medianByExperience.map((row) => (
            <div key={row.fullLabel}>
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span title={row.fullLabel}>
                  {row.shortLabel}
                  {row.count === 0 ? <span className="text-white/40"> (no data)</span> : null}
                </span>
                <span>{row.count > 0 ? formatUsd(row.median) : "—"}</span>
              </div>
              <div className="h-2 rounded bg-white/10">
                <div
                  className="h-2 rounded bg-[#38BDF8]"
                  style={{ width: row.count > 0 ? `${(row.median / maxExpMedian) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Remote vs Local vs Hybrid</h2>
        <div className="space-y-2">
          {stats.employmentDistribution.map((item) => (
            <div key={item.type}>
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span>{item.type}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-2 rounded bg-white/10">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${(item.count / maxEmployment) * 100}%`,
                    backgroundColor: EMPLOYMENT_CHART_COLORS[item.type] ?? "#64748b",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Recent Salaries</h2>
        <div className="space-y-3">
          {latest.map((entry) => (
            <article key={entry.id} className="rounded-md border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-medium text-white">
                  <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                  {entry.country} - {entry.job_title}
                </p>
                <p className="text-lg font-semibold text-[#38BDF8]">{formatUsd(entry.monthly_salary_usd)}/month</p>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {entry.profession_category} • {entry.employment_type} • {entry.experience_level}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Other professions in {countryName}</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROFESSIONS.map((profession) => (
            <Link
              key={profession}
              href={`/${params.country}/${toSlug(profession)}`}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:border-[#38BDF8]/50 hover:text-[#38BDF8]"
            >
              {profession}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass border border-[#38BDF8]/30 p-4 text-center">
        <p className="text-white">
          Planning to relocate?{" "}
          <a href="https://relova.ai" target="_blank" rel="noreferrer" className="font-semibold text-[#38BDF8]">
            Get your personalized plan at Relova →
          </a>
        </p>
      </section>
    </main>
  );
}

