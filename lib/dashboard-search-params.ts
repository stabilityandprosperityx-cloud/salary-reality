/** Build `/?country=…&profession=…&salaryType=…&page=…` for dashboard links (page 1 omits `page`). */
export function buildDashboardPath(opts: {
  country?: string | null;
  profession?: string | null;
  salaryType?: string | null;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (opts.country) sp.set("country", opts.country);
  if (opts.profession) sp.set("profession", opts.profession);
  if (opts.salaryType) sp.set("salaryType", opts.salaryType);
  if (opts.page !== undefined && opts.page > 1) sp.set("page", String(opts.page));
  const q = sp.toString();
  return q ? `/?${q}` : "/";
}
