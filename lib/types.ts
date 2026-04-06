export type SalaryEntry = {
  id: string;
  country: string;
  profession_category: string;
  job_title: string;
  monthly_salary_usd: number;
  salary_type: "gross" | "net";
  employment_type: "Remote" | "Local" | "Hybrid";
  experience_level: "Junior (0-2yr)" | "Mid (2-5yr)" | "Senior (5-10yr)" | "Lead/Principal (10yr+)";
  note: string | null;
  created_at: string;
};
