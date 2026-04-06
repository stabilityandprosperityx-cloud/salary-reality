import { unstable_noStore as noStore } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SalaryEntry } from "@/lib/types";

const SELECT_COLUMNS =
  "id,country,profession_category,job_title,monthly_salary_usd,salary_type,employment_type,experience_level,note,created_at";

export const SALARY_STATS_FETCH_LIMIT = 10_000;

export function createServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
        }),
    },
  });
}

type FilterOpts = { salaryType: "" | "gross" | "net"; country: string; profession: string };

function applySalaryFilters<T extends { eq: (column: string, value: string) => T }>(q: T, opts: FilterOpts): T {
  let query = q;
  if (opts.salaryType) query = query.eq("salary_type", opts.salaryType);
  if (opts.country) query = query.eq("country", opts.country);
  if (opts.profession) query = query.eq("profession_category", opts.profession);
  return query;
}

/** Exact row count for salary type only (dashboard hero / top “Total submissions”). */
export async function fetchScopeSalaryEntryCount(salaryType: "" | "gross" | "net"): Promise<number> {
  noStore();
  try {
    const supabase = createServerSupabase();
    if (!supabase) return 0;
    let q = supabase.from("salary_entries").select("id", { count: "exact", head: true });
    if (salaryType) q = q.eq("salary_type", salaryType);
    const { count, error } = await q;
    if (error) {
      console.error("Supabase scope count error:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Exact filtered count (matches list + charts selection). */
export async function fetchFilteredEntryCount(
  salaryType: "" | "gross" | "net",
  country: string,
  profession: string,
): Promise<number> {
  noStore();
  try {
    const supabase = createServerSupabase();
    if (!supabase) return 0;
    let q = supabase.from("salary_entries").select("id", { count: "exact", head: true });
    q = applySalaryFilters(q, { salaryType, country, profession });
    const { count, error } = await q;
    if (error) {
      console.error("Supabase filtered count error:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** One page of entries for current filters, newest first. */
export async function fetchFilteredEntriesPage(
  salaryType: "" | "gross" | "net",
  country: string,
  profession: string,
  page: number,
  perPage: number,
): Promise<SalaryEntry[]> {
  noStore();
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];
    const safePage = Math.max(1, page);
    const from = (safePage - 1) * perPage;
    const to = from + perPage - 1;
    let q = supabase.from("salary_entries").select(SELECT_COLUMNS);
    q = applySalaryFilters(q, { salaryType, country, profession });
    const { data, error } = await q.order("created_at", { ascending: false }).range(from, to);
    if (error) {
      console.error("Supabase paged fetch error:", error.message);
      return [];
    }
    return (data ?? []) as SalaryEntry[];
  } catch {
    return [];
  }
}

/** Up to `limit` rows for in-memory stats (charts, medians), same filters as the selection. */
export async function fetchFilteredEntriesForStats(
  salaryType: "" | "gross" | "net",
  country: string,
  profession: string,
  limit: number,
): Promise<SalaryEntry[]> {
  noStore();
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];
    let q = supabase.from("salary_entries").select(SELECT_COLUMNS);
    q = applySalaryFilters(q, { salaryType, country, profession });
    const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
    if (error) {
      console.error("Supabase stats fetch error:", error.message);
      return [];
    }
    return (data ?? []) as SalaryEntry[];
  } catch {
    return [];
  }
}

/** Scope-only rows (salary type) for top-row aggregates that ignore country/profession. */
export async function fetchScopeSalaryEntriesForStats(
  salaryType: "" | "gross" | "net",
  limit: number,
): Promise<SalaryEntry[]> {
  return fetchFilteredEntriesForStats(salaryType, "", "", limit);
}
