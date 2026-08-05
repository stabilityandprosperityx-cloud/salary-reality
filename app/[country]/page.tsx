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
  params: { country: string };
};

const EMPLOYMENT_CHART_COLORS: Record<string, string> = {
  Remote: "hsl(245 78% 62%)",
  Local: "hsl(168 55% 40%)",
  Hybrid: "hsl(280 70% 55%)",
};

export const revalidate = 3600;

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: toSlug(country) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countryName = fromSlug(params.country);
  const title = `Expat Salaries in ${countryName}: Real Data by Profession | Salary Reality`;
  const description = `Browse real anonymous salary data for expats and remote workers in ${countryName}. See median salaries by profession, experience level, and employment type.`;
  const canonical = `${SITE_URL}/${params.country}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CountryPage({ params }: Props) {
  const countryName = fromSlug(params.country);
  const [count, entries, latest] = await Promise.all([
    fetchFilteredEntryCount("", countryName, ""),
    fetchFilteredEntriesForStats("", countryName, "", SALARY_STATS_FETCH_LIMIT),
    fetchFilteredEntriesPage("", countryName, "", 1, 25),
  ]);
  const stats = makeDashboardData(entries, entries, { scopeTotalExact: count, filteredCountExact: count });
  const maxExpMedian = Math.max(
    ...stats.medianByExperience.filter((r) => r.count > 0).map((r) => r.median),
    1,
  );
  const maxEmployment = Math.max(...stats.employmentDistribution.map((i) => i.count), 1);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <Link href="/" className="text-sm text-primary hover:text-primary/80">
        ← All countries
      </Link>

      <section className="glass p-6">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Expat Salaries in {countryName}</h1>
        <p className="mt-2 text-muted-foreground">Based on {count} anonymously submitted salaries</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass p-4">
          <p className="text-sm text-muted-foreground">Median Salary</p>
          <p className="text-3xl font-semibold text-primary">{formatUsd(stats.filteredMedianSalary)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-muted-foreground">Salary Range</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatUsd(stats.filteredMinSalary)} - {formatUsd(stats.filteredMaxSalary)}
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-muted-foreground">Total Submissions</p>
          <p className="text-2xl font-semibold text-foreground">{stats.filteredCount}</p>
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Salaries by Profession</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROFESSIONS.map((profession) => (
            <Link
              key={profession}
              href={`/${params.country}/${toSlug(profession)}`}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground/85 transition hover:border-primary/50 hover:text-primary"
            >
              {profession}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Median by Experience Level</h2>
        <div className="space-y-3">
          {stats.medianByExperience.map((row) => (
            <div key={row.fullLabel}>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span title={row.fullLabel}>
                  {row.shortLabel}
                  {row.count === 0 ? <span className="text-muted-foreground/60"> (no data)</span> : null}
                </span>
                <span>{row.count > 0 ? formatUsd(row.median) : "—"}</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-primary"
                  style={{ width: row.count > 0 ? `${(row.median / maxExpMedian) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Recent Salaries</h2>
        <div className="space-y-3">
          {latest.map((entry) => (
            <article key={entry.id} className="rounded-md border border-border bg-secondary/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-medium text-foreground">
                  <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                  {entry.country} - {entry.job_title}
                </p>
                <p className="text-lg font-semibold text-primary">{formatUsd(entry.monthly_salary_usd)}/month</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.profession_category} • {entry.employment_type} • {entry.experience_level}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Remote vs Local vs Hybrid</h2>
        <div className="space-y-2">
          {stats.employmentDistribution.map((item) => (
            <div key={item.type}>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{item.type}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${(item.count / maxEmployment) * 100}%`,
                    backgroundColor: EMPLOYMENT_CHART_COLORS[item.type] ?? "hsl(220 8% 52%)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass border border-primary/30 p-4 text-center">
        <p className="text-foreground">
          Planning to relocate?{" "}
          <a href="https://relova.ai" target="_blank" rel="noreferrer" className="font-semibold text-primary">
            Get your personalized plan at Relova →
          </a>
        </p>
      </section>
    </main>
  );
}

