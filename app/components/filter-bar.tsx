"use client";

import { COUNTRIES, PROFESSION_CATEGORIES } from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const country = searchParams.get("country") ?? "";
  const profession = searchParams.get("profession") ?? "";
  const salaryType = searchParams.get("salaryType") ?? "";

  function updateParam(param: "country" | "profession" | "salaryType", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="glass grid gap-3 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="mb-1 text-sm text-white/80">Gross / Net</p>
        <div className="inline-flex overflow-hidden rounded-md border border-white/10">
          {[
            { id: "", label: "All" },
            { id: "gross", label: "Gross" },
            { id: "net", label: "Net" },
          ].map((option) => {
            const active = salaryType === option.id;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => updateParam("salaryType", option.id)}
                className={`px-3 py-1.5 text-sm transition ${
                  active ? "bg-[#38BDF8] text-[#0A0A0F]" : "bg-[#0A0A0F] text-white/80 hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
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
