import { FilterBar } from "@/app/components/filter-bar";
import { RefreshLoop } from "@/app/components/refresh-loop";
import { countryFlagEmoji } from "@/lib/flags";
import { formatUsd, makeDashboardData } from "@/lib/salary";
import { getSupabaseClient } from "@/lib/supabase";
import { SalaryEntry } from "@/lib/types";
import { cookies } from "next/headers";
import Link from "next/link";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    country?: string;
    profession?: string;
    salaryType?: string;
  };
};

const EMPLOYMENT_CHART_COLORS: Record<string, string> = {
  Remote: "#38BDF8",
  Local: "#22d3ee",
  Hybrid: "#a78bfa",
};

function employmentPieBackground(items: { type: string; count: number }[]): string | null {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  if (total === 0) return null;
  let acc = 0;
  const stops: string[] = [];
  for (const item of items) {
    const start = (acc / total) * 360;
    acc += item.count;
    const end = (acc / total) * 360;
    const color = EMPLOYMENT_CHART_COLORS[item.type] ?? "#64748b";
    stops.push(`${color} ${start}deg ${end}deg`);
  }
  return `conic-gradient(${stops.join(", ")})`;
}

export default async function Home({ searchParams }: Props) {
  const hasContributorCookie = cookies().get("salary_contributor")?.value === "true";
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("salary_entries")
    .select(
      "id,country,profession_category,job_title,monthly_salary_usd,salary_type,employment_type,experience_level,note,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const salaryType = searchParams.salaryType === "gross" || searchParams.salaryType === "net" ? searchParams.salaryType : "";
  const salaryScopeEntries = ((result.data ?? []) as SalaryEntry[]).filter((item) => {
    if (!salaryType) return true;
    return item.salary_type === salaryType;
  });

  const allEntries = salaryScopeEntries.filter((item) => {
    if (searchParams.country && item.country !== searchParams.country) return false;
    if (searchParams.profession && item.profession_category !== searchParams.profession) return false;
    return true;
  });
  const stats = makeDashboardData(salaryScopeEntries, allEntries);
  const maxCountry = Math.max(...stats.topCountries.map((item) => item.value), 1);
  const maxProfession = Math.max(...stats.topProfessions.map((item) => item.value), 1);
  const maxHistogram = Math.max(...stats.histogram.map((item) => item.count), 1);
  const maxExpMedian = Math.max(
    ...stats.medianByExperience.filter((r) => r.count > 0).map((r) => r.median),
    1,
  );
  const maxEmployment = Math.max(...stats.employmentDistribution.map((i) => i.count), 1);
  const employmentPie = employmentPieBackground(stats.employmentDistribution);
  const employmentTotal = stats.employmentDistribution.reduce((s, i) => s + i.count, 0);
  const gatedRows = hasContributorCookie ? stats.latest20 : stats.latest20.slice(0, 10);
  const lockedRows = hasContributorCookie ? [] : stats.latest20.slice(10);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <RefreshLoop />
      <section className="glass p-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Real Salaries Abroad. No Fluff.</h1>
        <p className="mt-2 text-white/70">
          {stats.totalSubmissions} salaries submitted. Updated in real time.{" "}
          <span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-200">
            Live
          </span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="glass p-4">
          <p className="text-sm text-white/60">Total submissions</p>
          <p className="text-xl font-semibold text-white">{stats.totalSubmissions}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Countries covered</p>
          <p className="text-xl font-semibold text-white">{stats.countriesCovered}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Professions covered</p>
          <p className="text-xl font-semibold text-white">{stats.professionsCovered}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Median gross / net</p>
          <p className="text-sm text-white/90">Median gross: {stats.medianGrossSalary > 0 ? formatUsd(stats.medianGrossSalary) : "—"}</p>
          <p className="text-sm text-white/90">Median net: {stats.medianNetSalary > 0 ? formatUsd(stats.medianNetSalary) : "—"}</p>
        </div>
      </section>

      <FilterBar />

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass p-4">
          <p className="text-sm text-white/60">Median salary</p>
          <p className="text-3xl font-semibold text-[#38BDF8]">{formatUsd(stats.filteredMedianSalary)}</p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Salary range</p>
          <p className="text-2xl font-semibold text-white">
            {formatUsd(stats.filteredMinSalary)} - {formatUsd(stats.filteredMaxSalary)}
          </p>
        </div>
        <div className="glass p-4">
          <p className="text-sm text-white/60">Submissions (selection)</p>
          <p className="text-2xl font-semibold text-white">{stats.filteredCount}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Median Salary by Country</h2>
          <div className="space-y-2">
            {stats.topCountries.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-xs text-white/70">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div className="h-2 rounded bg-[#38BDF8]" style={{ width: `${(item.value / maxCountry) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Salary Distribution</h2>
          <div className="space-y-2">
            {stats.histogram.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs text-white/70">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div
                    className="h-2 rounded bg-cyan-300"
                    style={{ width: `${(item.count / maxHistogram) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Salaries by Profession</h2>
          <div className="space-y-2">
            {stats.topProfessions.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-xs text-white/70">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div
                    className="h-2 rounded bg-sky-400"
                    style={{ width: `${(item.value / maxProfession) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Median Salary by Experience Level</h2>
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
                    style={{
                      width: row.count > 0 ? `${(row.median / maxExpMedian) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Remote vs Local vs Hybrid</h2>
          {employmentTotal === 0 ? (
            <p className="text-sm text-white/60">No submissions in this selection yet.</p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
              <div
                className="h-40 w-40 shrink-0 rounded-full border border-white/10 shadow-inner"
                style={{ background: employmentPie ?? undefined }}
                role="img"
                aria-label="Employment type distribution"
              />
              <div className="w-full max-w-xs space-y-2">
                {stats.employmentDistribution.map((item) => {
                  const pct = employmentTotal > 0 ? Math.round((item.count / employmentTotal) * 100) : 0;
                  return (
                    <div key={item.type}>
                      <div className="mb-1 flex justify-between text-xs text-white/70">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: EMPLOYMENT_CHART_COLORS[item.type] ?? "#64748b" }}
                          />
                          {item.type}
                        </span>
                        <span>
                          {item.count} ({pct}%)
                        </span>
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Latest Salaries</h2>
        {gatedRows.map((entry) => (
          <article key={entry.id} className="glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-medium text-white">
                <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                {entry.profession_category} - {entry.job_title}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs uppercase text-white/80">
                  {entry.salary_type}
                </span>
                <p className="text-lg font-semibold text-[#38BDF8]">{formatUsd(entry.monthly_salary_usd)}/month</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-white/70">
              {entry.country} • {entry.employment_type} • {entry.experience_level} •{" "}
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
        {lockedRows.length > 0 && (
          <>
            <div className="space-y-3 blur-[3px] opacity-70">
              {lockedRows.map((entry) => (
                <article key={entry.id} className="glass p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-medium text-white">
                      <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                      {entry.profession_category} - {entry.job_title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs uppercase text-white/80">
                        {entry.salary_type}
                      </span>
                      <p className="text-lg font-semibold text-[#38BDF8]">{formatUsd(entry.monthly_salary_usd)}/month</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Link
              href="/submit"
              className="glass block cursor-pointer border border-[#38BDF8]/30 p-4 text-center text-white transition hover:border-[#38BDF8] hover:bg-[#38BDF8]/10"
            >
              See all {stats.filteredCount} salaries — Submit yours to unlock
            </Link>
          </>
        )}
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
