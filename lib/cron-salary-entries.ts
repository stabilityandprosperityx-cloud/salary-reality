import { COUNTRIES, EXPERIENCE_LEVELS, SALARY_TYPES } from "@/lib/constants";
import { computeMonthlySalaryUsd } from "@/lib/salary-distributions";

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
type SalaryType = (typeof SALARY_TYPES)[number];

/** Weights sum to 84; remaining 16% is "other" countries from COUNTRIES. */
const TOP_COUNTRY_WEIGHTS: readonly (readonly [string, number])[] = [
  ["Portugal", 12],
  ["Germany", 10],
  ["Spain", 8],
  ["United Arab Emirates", 8],
  ["Netherlands", 7],
  ["United Kingdom", 7],
  ["United States", 7],
  ["Thailand", 6],
  ["Georgia", 5],
  ["Canada", 5],
  ["France", 5],
  ["Switzerland", 4],
] as const;

const TOP_COUNTRY_SUM = TOP_COUNTRY_WEIGHTS.reduce((a, [, w]) => a + w, 0);
const TOP_COUNTRY_SET = new Set(TOP_COUNTRY_WEIGHTS.map(([c]) => c));

const OTHER_COUNTRIES_POOL = COUNTRIES.filter((c) => !TOP_COUNTRY_SET.has(c));

const PROFESSION_WEIGHTS: readonly (readonly [string, number])[] = [
  ["Software Engineering", 22],
  ["Design / UX", 8],
  ["Marketing / Growth", 8],
  ["Sales", 8],
  ["Finance / Accounting", 7],
  ["Data / Analytics", 7],
  ["Product Management", 6],
  ["Operations / Management", 6],
  ["Customer Support", 5],
  ["Healthcare / Medical", 5],
  ["Education / Teaching", 4],
  ["Content / Writing", 4],
  ["Legal", 3],
  ["Consulting", 3],
  ["Other", 4],
] as const;

const PROFESSION_SUM = PROFESSION_WEIGHTS.reduce((a, [, w]) => a + w, 0);

const EMPLOYMENT_WEIGHTS: readonly (readonly [string, number])[] = [
  ["Remote", 45],
  ["Local", 35],
  ["Hybrid", 20],
] as const;
const EMPLOYMENT_SUM = EMPLOYMENT_WEIGHTS.reduce((a, [, w]) => a + w, 0);

const EXPERIENCE_WEIGHTS: readonly (readonly [ExperienceLevel, number])[] = [
  ["Junior (0-2yr)", 20],
  ["Mid (2-5yr)", 35],
  ["Senior (5-10yr)", 30],
  ["Lead/Principal (10yr+)", 15],
] as const;
const EXPERIENCE_SUM = EXPERIENCE_WEIGHTS.reduce((a, [, w]) => a + w, 0);

const SALARY_TYPE_WEIGHTS: readonly (readonly [SalaryType, number])[] = [
  ["gross", 60],
  ["net", 40],
] as const;
const SALARY_TYPE_SUM = SALARY_TYPE_WEIGHTS.reduce((a, [, w]) => a + w, 0);

const JOB_BY_PROF: Record<string, readonly string[]> = {
  "Software Engineering": [
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "Mobile Developer",
    "DevOps Engineer",
    "Platform Engineer",
    "Security Engineer",
    "Staff Engineer",
    "Engineering Manager",
    "QA Automation Engineer",
    "Site Reliability Engineer",
    "Data Engineer",
    "ML Engineer",
    "Embedded Engineer",
  ],
  "Design / UX": ["Product Designer", "UX Designer", "UI Designer", "Design Lead", "Brand Designer", "Motion Designer"],
  "Marketing / Growth": ["Growth Marketer", "Performance Marketer", "SEO Specialist", "Marketing Manager", "Demand Gen Manager"],
  Sales: ["Account Executive", "Sales Manager", "SDR", "BDR", "Solutions Engineer", "Sales Ops Analyst"],
  "Finance / Accounting": ["Financial Analyst", "Accountant", "FP&A Analyst", "Controller", "Finance Manager"],
  "Data / Analytics": ["Data Analyst", "BI Analyst", "Analytics Engineer", "Business Analyst", "Data Scientist"],
  "Product Management": ["Product Manager", "Associate PM", "Senior PM", "Group PM"],
  "Operations / Management": ["Operations Manager", "Program Manager", "Supply Chain Analyst", "Biz Ops Lead"],
  "Customer Support": ["Support Specialist", "Customer Success Manager", "Technical Support Lead"],
  "Healthcare / Medical": ["Registered Nurse", "Physician Assistant", "Medical Technologist", "Clinical Specialist"],
  "Education / Teaching": ["Teacher", "Curriculum Lead", "Adjunct Instructor", "Training Specialist"],
  "Content / Writing": ["Content Strategist", "Technical Writer", "Copywriter", "Editor"],
  Legal: ["Corporate Counsel", "Paralegal", "Compliance Analyst"],
  Consulting: ["Strategy Consultant", "IT Consultant", "Implementation Consultant"],
  Other: ["Office Manager", "Executive Assistant", "Analyst", "Coordinator"],
};

const NOTE_OPTIONS = [
  "Includes annual bonus averaged monthly.",
  "Equity not included in base.",
  "Overtime rarely required.",
  "US employer via EOR.",
  "Startup; salary reviewed at 12 months.",
  "Big tech RSUs separate.",
  "Contractor rate converted to monthly equiv.",
  "Part-time scaled to FTE estimate.",
  "Relocation package received separately.",
  "Language premium included.",
  "Night shift differential included.",
  "Commission not included in base.",
  "13th month pay spread across year.",
  "Health stipend separate line.",
  "Remote-first; no office allowance.",
  "Visa sponsorship in package.",
  "Probation salary; raised after 6 mo.",
  "Non-profit; below market by choice.",
  "Public sector pay scale.",
  "Academic institution scale.",
] as const;

function pickWeighted<T extends string>(pairs: readonly (readonly [T, number])[], total: number, rnd: () => number): T {
  const cut = rnd() * total;
  let acc = 0;
  for (const [value, w] of pairs) {
    acc += w;
    if (cut < acc) return value;
  }
  return pairs[pairs.length - 1]![0];
}

function pickCountry(rnd: () => number): string {
  if (rnd() < 0.16) {
    const i = Math.floor(rnd() * OTHER_COUNTRIES_POOL.length);
    return OTHER_COUNTRIES_POOL[i]!;
  }
  const cut = rnd() * TOP_COUNTRY_SUM;
  let acc = 0;
  for (const [c, w] of TOP_COUNTRY_WEIGHTS) {
    acc += w;
    if (cut < acc) return c;
  }
  return TOP_COUNTRY_WEIGHTS[TOP_COUNTRY_WEIGHTS.length - 1]![0];
}

export type CronSalaryInsertRow = {
  country: string;
  profession_category: string;
  job_title: string;
  monthly_salary_usd: number;
  salary_type: SalaryType;
  employment_type: string;
  experience_level: ExperienceLevel;
  note: string | null;
  ip_hash: string;
  created_at: string;
};

export function generateCronSalaryEntry(rnd: () => number, ipHash: string, createdAtIso: string): CronSalaryInsertRow {
  const country = pickCountry(rnd);
  const profession_category = pickWeighted([...PROFESSION_WEIGHTS], PROFESSION_SUM, rnd);
  const employment_type = pickWeighted([...EMPLOYMENT_WEIGHTS], EMPLOYMENT_SUM, rnd);
  const experience_level = pickWeighted([...EXPERIENCE_WEIGHTS], EXPERIENCE_SUM, rnd);
  const salary_type = pickWeighted([...SALARY_TYPE_WEIGHTS], SALARY_TYPE_SUM, rnd);

  const titles = JOB_BY_PROF[profession_category] ?? JOB_BY_PROF["Other"]!;
  const job_title = titles[Math.floor(rnd() * titles.length)]!.slice(0, 60);

  const monthly_salary_usd = computeMonthlySalaryUsd(country, experience_level, salary_type, rnd);
  const note = rnd() < 0.35 ? NOTE_OPTIONS[Math.floor(rnd() * NOTE_OPTIONS.length)]! : null;

  return {
    country,
    profession_category,
    job_title,
    monthly_salary_usd,
    salary_type,
    employment_type,
    experience_level,
    note,
    ip_hash: ipHash,
    created_at: createdAtIso,
  };
}
