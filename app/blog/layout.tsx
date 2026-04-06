import Link from "next/link";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0A0A0F]">
      <div className="border-b border-white/10 bg-[#12121A]/90">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
          <Link href="https://salary.relova.ai" className="font-medium text-[#38BDF8] hover:underline">
            ← Salary Reality dashboard (salary.relova.ai)
          </Link>
          <Link href="/blog" className="text-white/60 hover:text-white">
            All posts
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
