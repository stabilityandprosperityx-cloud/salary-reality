import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center text-foreground">
      <h1 className="text-2xl font-semibold">Article not found</h1>
      <p className="mt-2 text-muted-foreground">That blog post does not exist or was moved.</p>
      <Link href="/blog" className="mt-6 inline-block text-primary hover:underline">
        ← Back to blog
      </Link>
    </main>
  );
}
