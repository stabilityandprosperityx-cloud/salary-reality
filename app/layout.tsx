import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salary Reality",
  description: "Crowdsourced real salary data by country and profession.",
  icons: { icon: "/favicon.svg" },
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = getSupabaseClient();
  const countResult = await supabase.from("salary_entries").select("id", { count: "exact", head: true });
  const totalShared = countResult.error ? 0 : (countResult.count ?? 0);

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-white/10 bg-[#12121A]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight text-white">
              Salary Reality <span className="text-sm font-normal text-white/60">by Relova</span>
            </Link>
            <div className="flex items-center gap-4">
              <p className="text-sm text-white/60">
                <span aria-hidden>👥</span>{" "}
                <span className="font-semibold text-[#22C55E]">{totalShared}</span> people sharing salaries
              </p>
              <Link
                href="/submit"
                className="rounded-md bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16A34A]"
              >
                Submit Your Salary
              </Link>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
