/** Monthly USD: experience band × country tier; net = gross × country-specific take-home ratio (matches seed data). */

export const EXP_BASE_RANGES: Record<string, readonly [number, number]> = {
  "Junior (0-2yr)": [800, 2500],
  "Mid (2-5yr)": [2000, 5000],
  "Senior (5-10yr)": [4000, 9000],
  "Lead/Principal (10yr+)": [7000, 15000],
};

export function multiplierRange(country: string): readonly [number, number] {
  if (["United Arab Emirates", "Switzerland", "United States"].includes(country)) return [1.8, 2.5];
  if (["Germany", "Netherlands", "United Kingdom"].includes(country)) return [1.3, 1.8];
  if (["Portugal", "Spain", "France"].includes(country)) return [0.8, 1.1];
  if (["Georgia", "Thailand"].includes(country)) return [0.4, 0.7];
  if (country === "Canada") return [1.2, 1.7];
  return [0.85, 1.25];
}

export function netRatioRange(country: string): readonly [number, number] {
  if (["Germany", "France", "Netherlands"].includes(country)) return [0.58, 0.65];
  if (["United Kingdom", "Spain", "Portugal"].includes(country)) return [0.68, 0.75];
  if (["United Arab Emirates", "Switzerland"].includes(country)) return [0.85, 0.95];
  if (["Georgia", "Thailand"].includes(country)) return [0.8, 0.88];
  if (country === "United States") return [0.65, 0.75];
  if (country === "Canada") return [0.68, 0.74];
  return [0.66, 0.76];
}

function rndIntInclusive(rnd: () => number, min: number, max: number) {
  return min + Math.floor(rnd() * (max - min + 1));
}

function rndFloat(rnd: () => number, min: number, max: number) {
  return min + rnd() * (max - min);
}

export function computeMonthlySalaryUsd(
  country: string,
  experienceLevel: string,
  salaryType: "gross" | "net",
  rnd: () => number,
): number {
  const base = EXP_BASE_RANGES[experienceLevel];
  if (!base) throw new Error(`Unknown experience_level: ${experienceLevel}`);
  const [bMin, bMax] = base;
  const g0 = rndIntInclusive(rnd, bMin, bMax);
  const [mLo, mHi] = multiplierRange(country);
  const mult = rndFloat(rnd, mLo, mHi);
  const gross = Math.max(1, Math.round(g0 * mult));
  if (salaryType === "net") {
    const [nLo, nHi] = netRatioRange(country);
    const ratio = rndFloat(rnd, nLo, nHi);
    return Math.max(1, Math.round(gross * ratio));
  }
  return gross;
}
