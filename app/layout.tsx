import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase";
import { ThemeProvider } from "@/app/components/theme-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600;1,9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <header className="border-b border-border bg-card/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-foreground">
                Salary Reality <span className="font-sans text-sm font-normal text-muted-foreground">by Relova</span>
              </Link>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link href="/blog" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
                  Blog
                </Link>
                <p className="text-sm text-muted-foreground">
                  <span aria-hidden>👥</span>{" "}
                  <span className="font-semibold text-primary">{totalShared}</span> people sharing salaries
                </p>
                <ThemeToggle />
                <Link
                  href="/submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Submit Your Salary
                </Link>
              </div>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
