import { generateCronSalaryEntry } from "@/lib/cron-salary-entries";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function randomHex64() {
  return randomBytes(32).toString("hex");
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const count = 2 + Math.floor(Math.random() * 2);
  const createdAt = new Date().toISOString();
  const rows = Array.from({ length: count }, () =>
    generateCronSalaryEntry(() => Math.random(), randomHex64(), createdAt),
  );

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("salary_entries").insert(rows);

  if (error) {
    console.error("cron add-salaries insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: count });
}
