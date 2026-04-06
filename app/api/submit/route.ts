import { COUNTRIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, PROFESSION_CATEGORIES, SALARY_TYPES } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

function getIpHash() {
  const headerStore = headers();
  const forward = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = forward?.split(",")[0]?.trim() || realIp || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      country?: string;
      professionCategory?: string;
      jobTitle?: string;
      monthlySalaryUsd?: number;
      salaryType?: string;
      employmentType?: string;
      experienceLevel?: string;
      note?: string;
    };

    if (
      !body.country ||
      !COUNTRIES.includes(body.country as (typeof COUNTRIES)[number]) ||
      !body.professionCategory ||
      !PROFESSION_CATEGORIES.includes(body.professionCategory as (typeof PROFESSION_CATEGORIES)[number]) ||
      !body.jobTitle ||
      body.jobTitle.length > 60 ||
      !Number.isFinite(body.monthlySalaryUsd) ||
      Number(body.monthlySalaryUsd) < 1 ||
      !body.salaryType ||
      !SALARY_TYPES.includes(body.salaryType as (typeof SALARY_TYPES)[number]) ||
      !body.employmentType ||
      !EMPLOYMENT_TYPES.includes(body.employmentType as (typeof EMPLOYMENT_TYPES)[number]) ||
      !body.experienceLevel ||
      !EXPERIENCE_LEVELS.includes(body.experienceLevel as (typeof EXPERIENCE_LEVELS)[number]) ||
      (body.note?.length ?? 0) > 200
    ) {
      return NextResponse.json({ error: "Invalid submission data." }, { status: 400 });
    }

    const ipHash = getIpHash();
    const supabase = getSupabaseClient();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const rateCheck = await supabase
      .from("salary_entries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (rateCheck.error) {
      return NextResponse.json({ error: "Rate limit check failed." }, { status: 500 });
    }

    if ((rateCheck.count ?? 0) >= 5) {
      return NextResponse.json({ error: "Rate limit reached (5 submissions per hour)." }, { status: 429 });
    }

    const insertion = await supabase.from("salary_entries").insert({
      country: body.country,
      profession_category: body.professionCategory,
      job_title: body.jobTitle.trim(),
      monthly_salary_usd: Math.round(Number(body.monthlySalaryUsd)),
      salary_type: body.salaryType,
      employment_type: body.employmentType,
      experience_level: body.experienceLevel,
      note: body.note?.trim() || null,
      ip_hash: ipHash,
    });

    if (insertion.error) {
      return NextResponse.json({ error: insertion.error.message }, { status: 500 });
    }

    revalidatePath("/");

    const response = NextResponse.json({ ok: true });
    response.cookies.set("salary_contributor", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
