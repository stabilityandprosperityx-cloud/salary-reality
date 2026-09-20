import type { Metadata } from "next";
import { SubmitForm } from "@/app/components/submit-form";
import { SITE_URL } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Share Your Salary Anonymously | Salary Reality",
  description:
    "Submit your real salary anonymously by country and profession. Help build a crowdsourced, honest picture of what people actually earn abroad.",
  alternates: { canonical: `${SITE_URL}/submit` },
  // openGraph merging with the root layout is shallow (replaces the whole
  // object), so images has to be restated here or this page loses the
  // default og:image set on app/layout.tsx.
  openGraph: {
    title: "Share Your Salary Anonymously | Salary Reality",
    description:
      "Submit your real salary anonymously by country and profession. Help build a crowdsourced, honest picture of what people actually earn abroad.",
    url: `${SITE_URL}/submit`,
    images: [{ url: `${SITE_URL}/og/og-default.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/og/og-default.jpg`],
  },
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Share Your Real Salary</h1>
        <p className="mt-2 text-muted-foreground">
          Anonymous contribution. No fluff, just what people actually earn abroad.
        </p>
      </div>
      <SubmitForm />
    </main>
  );
}
