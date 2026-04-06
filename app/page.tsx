import { FilterBar } from "@/app/components/filter-bar";
import { RefreshLoop } from "@/app/components/refresh-loop";
import { COUNTRIES, PROFESSION_CATEGORIES } from "@/lib/constants";
import { formatUsd, makeDashboardData } from "@/lib/salary";
import { getSupabaseClient } from "@/lib/supabase";
import { SalaryEntry } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    country?: string;
    profession?: string;
  };
};

function countryFlagEmoji(countryName: string): string {
  const REGION_CODES: Record<string, string> = {
    Argentina: "AR",
    Australia: "AU",
    Austria: "AT",
    Belgium: "BE",
    Brazil: "BR",
    Bulgaria: "BG",
    Canada: "CA",
    Chile: "CL",
    China: "CN",
    Colombia: "CO",
    Croatia: "HR",
    "Czech Republic": "CZ",
    Denmark: "DK",
    Egypt: "EG",
    Estonia: "EE",
    Finland: "FI",
    France: "FR",
    Germany: "DE",
    Greece: "GR",
    "Hong Kong": "HK",
    Hungary: "HU",
    India: "IN",
    Indonesia: "ID",
    Ireland: "IE",
    Israel: "IL",
    Italy: "IT",
    Japan: "JP",
    Kenya: "KE",
    Malaysia: "MY",
    Mexico: "MX",
    Morocco: "MA",
    Netherlands: "NL",
    "New Zealand": "NZ",
    Nigeria: "NG",
    Norway: "NO",
    Pakistan: "PK",
    Peru: "PE",
    Philippines: "PH",
    Poland: "PL",
    Portugal: "PT",
    Romania: "RO",
    "Saudi Arabia": "SA",
    Serbia: "RS",
    Singapore: "SG",
    "South Africa": "ZA",
    "South Korea": "KR",
    Spain: "ES",
    Sweden: "SE",
    Switzerland: "CH",
    Thailand: "TH",
    Turkey: "TR",
    Ukraine: "UA",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    "United States": "US",
    Uruguay: "UY",
    Vietnam: "VN",
  };

  const code = REGION_CODES[countryName];
  if (!code) return "🌍";
  return String.fromCodePoint(...code.split("").map((c) => 127397 + c.charCodeAt(0)));
}

export default async function Home({ searchParams }: Props) {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from("salary_entries")
    .select(
      "id,country,profession_category,job_title,monthly_salary_usd,employment_type,experience_level,note,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allEntries = ((result.data ?? []) as SalaryEntry[]).filter((item) => {
    if (searchParams.country && item.country !== searchParams.country) return false;
    if (searchParams.profession && item.profession_category !== searchParams.profession) return false;
    return true;
  });
  const unfilteredEntries = (result.data ?? []) as SalaryEntry[];
  const stats = makeDashboardData(unfilteredEntries, allEntries);
  const maxCountry = Math.max(...stats.topCountries.map((item) => item.value), 1);
  const maxProfession = Math.max(...stats.topProfessions.map((item) => item.value), 1);
  const maxHistogram = Math.max(...stats.histogram.map((item) => item.count), 1);
  const gatedRows = stats.latest20.slice(0, 10);
  const lockedRows = stats.latest20.slice(10);

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
          <p className="text-sm text-white/60">Median salary (all)</p>
          <p className="text-xl font-semibold text-white">{formatUsd(stats.allMedianSalary)}</p>
        </div>
      </section>

      <FilterBar countries={COUNTRIES} professions={PROFESSION_CATEGORIES} />

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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Latest Salaries</h2>
        {gatedRows.map((entry) => (
          <article key={entry.id} className="glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-medium text-white">
                <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                {entry.profession_category} - {entry.job_title}
              </p>
              <p className="text-lg font-semibold text-[#38BDF8]">{formatUsd(entry.monthly_salary_usd)}/month</p>
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
                    <p className="text-lg font-semibold text-[#38BDF8]">{formatUsd(entry.monthly_salary_usd)}/month</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="glass border border-[#38BDF8]/30 p-4 text-center text-white">
              See all {stats.filteredCount} salaries — Submit yours to unlock
            </div>
          </>
        )}
      </section>

      <section className="glass border border-[#38BDF8]/30 p-4 text-center">
        <p className="text-white">
          Planning to relocate?{" "}
          <a href="https://relova.co" target="_blank" rel="noreferrer" className="font-semibold text-[#38BDF8]">
            Get your personalized plan at Relova →
          </a>
        </p>
      </section>
    </main>
  );
}
