import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/lib/constants";
import { SalaryEntry } from "@/lib/types";

const EXPERIENCE_CHART_LABELS: Record<(typeof EXPERIENCE_LEVELS)[number], string> = {
  "Junior (0-2yr)": "Junior",
  "Mid (2-5yr)": "Mid",
  "Senior (5-10yr)": "Senior",
  "Lead/Principal (10yr+)": "Lead",
};

export type DashboardData = {
  totalSubmissions: number;
  countriesCovered: number;
  professionsCovered: number;
  allMedianSalary: number;
  medianGrossSalary: number;
  medianNetSalary: number;
  filteredMedianSalary: number;
  filteredMinSalary: number;
  filteredMaxSalary: number;
  filteredCount: number;
  latest20: SalaryEntry[];
  topCountries: { name: string; value: number }[];
  topProfessions: { name: string; value: number }[];
  histogram: { label: string; count: number }[];
  medianByExperience: { shortLabel: string; fullLabel: string; median: number; count: number }[];
  employmentDistribution: { type: string; count: number }[];
};

const HISTOGRAM_BUCKETS = [0, 1000, 2000, 3000, 5000, 7000, 10000, 15000, Number.POSITIVE_INFINITY];

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
}

function toHistogram(entries: SalaryEntry[]) {
  const counts = new Array(HISTOGRAM_BUCKETS.length - 1).fill(0);

  for (const item of entries) {
    const salary = item.monthly_salary_usd;
    const index = HISTOGRAM_BUCKETS.findIndex((start, i) => {
      if (i === HISTOGRAM_BUCKETS.length - 1) return false;
      return salary >= start && salary < HISTOGRAM_BUCKETS[i + 1];
    });
    if (index >= 0) counts[index] += 1;
  }

  return counts.map((count, i) => {
    const start = HISTOGRAM_BUCKETS[i];
    const end = HISTOGRAM_BUCKETS[i + 1];
    return {
      label: Number.isFinite(end) ? `$${start}-$${end - 1}` : `$${start}+`,
      count,
    };
  });
}

function topBy<T>(entries: SalaryEntry[], key: (item: SalaryEntry) => T, limit = 10) {
  const map = new Map<T, number>();
  for (const item of entries) {
    map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name: String(name), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function medianByExperienceLevel(entries: SalaryEntry[]) {
  return EXPERIENCE_LEVELS.map((level) => {
    const salaries = entries.filter((e) => e.experience_level === level).map((e) => e.monthly_salary_usd);
    return {
      shortLabel: EXPERIENCE_CHART_LABELS[level],
      fullLabel: level,
      median: median(salaries),
      count: salaries.length,
    };
  });
}

function employmentCounts(entries: SalaryEntry[]) {
  return EMPLOYMENT_TYPES.map((type) => ({
    type,
    count: entries.filter((e) => e.employment_type === type).length,
  }));
}

export function makeDashboardData(
  allEntries: SalaryEntry[],
  filteredEntries: SalaryEntry[],
  options?: { scopeTotalExact?: number; filteredCountExact?: number },
): DashboardData {
  const allSalaries = allEntries.map((e) => e.monthly_salary_usd);
  const filteredSalaries = filteredEntries.map((e) => e.monthly_salary_usd);
  const grossSalaries = filteredEntries.filter((e) => e.salary_type === "gross").map((e) => e.monthly_salary_usd);
  const netSalaries = filteredEntries.filter((e) => e.salary_type === "net").map((e) => e.monthly_salary_usd);

  return {
    totalSubmissions: options?.scopeTotalExact ?? allEntries.length,
    countriesCovered: new Set(allEntries.map((e) => e.country)).size,
    professionsCovered: new Set(allEntries.map((e) => e.profession_category)).size,
    allMedianSalary: median(allSalaries),
    medianGrossSalary: median(grossSalaries),
    medianNetSalary: median(netSalaries),
    filteredMedianSalary: median(filteredSalaries),
    filteredMinSalary: filteredSalaries.length > 0 ? Math.min(...filteredSalaries) : 0,
    filteredMaxSalary: filteredSalaries.length > 0 ? Math.max(...filteredSalaries) : 0,
    filteredCount: options?.filteredCountExact ?? filteredEntries.length,
    latest20: [...filteredEntries]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20),
    topCountries: topBy(filteredEntries, (e) => e.country),
    topProfessions: topBy(filteredEntries, (e) => e.profession_category),
    histogram: toHistogram(filteredEntries),
    medianByExperience: medianByExperienceLevel(filteredEntries),
    employmentDistribution: employmentCounts(filteredEntries),
  };
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    amount,
  );
}
