"use client";

import { COUNTRIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, PROFESSION_CATEGORIES, SALARY_TYPES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SubmitForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employmentType, setEmploymentType] = useState<(typeof EMPLOYMENT_TYPES)[number]>("Remote");
  const [salaryType, setSalaryType] = useState<(typeof SALARY_TYPES)[number]>("gross");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      country: String(formData.get("country") ?? ""),
      professionCategory: String(formData.get("professionCategory") ?? ""),
      jobTitle: String(formData.get("jobTitle") ?? ""),
      monthlySalaryUsd: Number(formData.get("monthlySalaryUsd") ?? 0),
      salaryType,
      employmentType,
      experienceLevel: String(formData.get("experienceLevel") ?? ""),
      note: String(formData.get("note") ?? ""),
    };

    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as { error?: string };
    setIsLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Failed to submit salary entry.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass mx-auto grid max-w-3xl gap-4 p-6">
      <label className="text-sm text-muted-foreground">
        Country
        <select
          name="country"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          defaultValue=""
        >
          <option value="" disabled>
            Select country
          </option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-muted-foreground">
        Profession Category
        <select
          name="professionCategory"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          defaultValue=""
        >
          <option value="" disabled>
            Select profession category
          </option>
          {PROFESSION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-muted-foreground">
        Specific Job Title
        <input
          type="text"
          name="jobTitle"
          maxLength={60}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="e.g. Backend Engineer"
        />
      </label>

      <label className="text-sm text-muted-foreground">
        Monthly Salary in USD
        <input
          type="number"
          name="monthlySalaryUsd"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="e.g. 4500"
        />
      </label>

      <fieldset className="rounded-md border border-border p-3">
        <legend className="px-1 text-sm text-muted-foreground">Is this gross or net salary?</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {SALARY_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="salaryType"
                checked={salaryType === type}
                onChange={() => setSalaryType(type)}
              />
              {type === "gross" ? "Gross (before tax)" : "Net (after tax)"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-border p-3">
        <legend className="px-1 text-sm text-muted-foreground">Employment Type</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {EMPLOYMENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="employmentType"
                checked={employmentType === type}
                onChange={() => setEmploymentType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="text-sm text-muted-foreground">
        Experience Level
        <select
          name="experienceLevel"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          defaultValue=""
        >
          <option value="" disabled>
            Select level
          </option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-muted-foreground">
        Optional: Short note
        <textarea
          name="note"
          maxLength={200}
          rows={4}
          className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="Anything useful about your compensation context"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
      >
        {isLoading ? "Submitting..." : "Submit salary"}
      </button>
    </form>
  );
}
