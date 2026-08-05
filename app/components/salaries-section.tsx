import Link from "next/link";
import { countryFlagEmoji } from "@/lib/flags";
import { buildDashboardPath } from "@/lib/dashboard-search-params";
import { formatCount } from "@/lib/format";
import { ENTRIES_PER_PAGE, getPageNavItems } from "@/lib/pagination";
import { formatUsd } from "@/lib/salary";
import type { SalaryEntry } from "@/lib/types";

export function SalariesSection({
  entries,
  totalCount,
  currentPage,
  totalPages,
  country,
  profession,
  salaryType,
}: {
  entries: SalaryEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  country: string;
  profession: string;
  salaryType: string;
}) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * ENTRIES_PER_PAGE + 1;
  const end = totalCount === 0 ? 0 : Math.min(start + entries.length - 1, totalCount);

  const navItems = getPageNavItems(currentPage, totalPages);
  const prevHref = buildDashboardPath({
    country: country || null,
    profession: profession || null,
    salaryType: salaryType || null,
    page: currentPage > 2 ? currentPage - 1 : undefined,
  });
  const nextHref = buildDashboardPath({
    country: country || null,
    profession: profession || null,
    salaryType: salaryType || null,
    page: currentPage + 1 <= totalPages ? currentPage + 1 : totalPages,
  });

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">Latest Salaries</h2>
      <p className="text-sm text-muted-foreground">
        {totalCount === 0 ? (
          <>No salaries match your filters yet.</>
        ) : (
          <>
            Showing {formatCount(start)}–{formatCount(end)} of {formatCount(totalCount)} salaries
          </>
        )}
      </p>

      <div className="space-y-3">
        {entries.map((entry) => (
          <article key={entry.id} className="glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-medium text-foreground">
                <span className="mr-2">{countryFlagEmoji(entry.country)}</span>
                {entry.profession_category} - {entry.job_title}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs uppercase text-secondary-foreground">
                  {entry.salary_type}
                </span>
                <p className="text-lg font-semibold text-primary">{formatUsd(entry.monthly_salary_usd)}/month</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {entry.country} • {entry.employment_type} • {entry.experience_level} •{" "}
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center"
          aria-label="Salary list pagination"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentPage <= 1 ? (
              <span className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground/50">Previous</span>
            ) : (
              <Link
                href={prevHref}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                Previous
              </Link>
            )}
            {navItems.map((item, i) =>
              item.kind === "ellipsis" ? (
                <span key={`e-${i}`} className="px-1 text-sm text-muted-foreground" aria-hidden>
                  …
                </span>
              ) : item.page === currentPage ? (
                <span
                  key={item.page}
                  className="rounded-lg border border-primary bg-primary/15 px-3 py-2 text-sm font-semibold text-primary"
                  aria-current="page"
                >
                  {item.page}
                </span>
              ) : (
                <Link
                  key={item.page}
                  href={buildDashboardPath({
                    country: country || null,
                    profession: profession || null,
                    salaryType: salaryType || null,
                    page: item.page,
                  })}
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground transition hover:border-input hover:text-foreground"
                >
                  {item.page}
                </Link>
              ),
            )}
            {currentPage >= totalPages ? (
              <span className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground/50">Next</span>
            ) : (
              <Link
                href={nextHref}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
