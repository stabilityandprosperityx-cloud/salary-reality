import { SubmitForm } from "@/app/components/submit-form";

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
