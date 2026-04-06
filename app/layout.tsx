import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salary Reality",
  description: "Crowdsourced real salary data by country and profession.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-white/10 bg-[#12121A]/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight text-white">
              Salary Reality <span className="text-sm font-normal text-white/60">by Relova</span>
            </Link>
            <Link
              href="/submit"
              className="rounded-md bg-[#38BDF8] px-4 py-2 text-sm font-medium text-[#0A0A0F] transition hover:bg-sky-300"
            >
              Submit Your Salary
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
