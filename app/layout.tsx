import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const INLINE_FAVICON_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJTYWxhcnkgUmVhbGl0eSBmYXZpY29uIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxMiIgZmlsbD0iIzBBMEEwRiIvPjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkludGVyLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzIyQzU1RSI+U1I8L3RleHQ+PC9zdmc+";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://salary.relova.ai"),
  title: "Salary Reality",
  description: "Crowdsourced real salary data by country and profession.",
  icons: {
    icon: [
      { url: INLINE_FAVICON_DATA_URI, type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
  },
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <header className="border-b border-white/10 bg-[#12121A]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight text-white">
              Salary Reality <span className="text-sm font-normal text-white/60">by Relova</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/blog" className="text-sm font-medium text-white/80 hover:text-[#38BDF8]">
                Blog
              </Link>
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
