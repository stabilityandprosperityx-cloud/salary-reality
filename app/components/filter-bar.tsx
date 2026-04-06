"use client";

import { COUNTRIES, PROFESSION_CATEGORIES } from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const country = searchParams.get("country") ?? "";
  const profession = searchParams.get("profession") ?? "";

  function updateParam(param: "country" | "profession", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="glass grid gap-3 p-4 md:grid-cols-2">
      <label className="text-sm text-white/80">
        Country
        <select
          className="mt-1 w-full rounded-md border border-white/10 bg-[#0A0A0F] px-3 py-2 text-white"
          value={country}
          onChange={(e) => updateParam("country", e.target.value)}
        >
          <option value="">All countries</option>
          {COUNTRIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-white/80">
        Profession category
        <select
          className="mt-1 w-full rounded-md border border-white/10 bg-[#0A0A0F] px-3 py-2 text-white"
          value={profession}
          onChange={(e) => updateParam("profession", e.target.value)}
        >
          <option value="">All categories</option>
          {PROFESSION_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
