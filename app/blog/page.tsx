import { getAllPostsMeta, SITE_URL } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Salary Reality",
  description:
    "In-depth salary guides for expats, remote workers, and tech professionals—gross vs net, country comparisons, and real relocation numbers.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog | Salary Reality",
    description:
      "In-depth salary guides for expats, remote workers, and tech professionals—gross vs net, country comparisons, and real relocation numbers.",
    url: `${SITE_URL}/blog`,
    siteName: "Salary Reality",
    type: "website",
    locale: "en_US",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Salary Reality Blog</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Practical salary intelligence for moving abroad, negotiating remote pay, and understanding what you actually take home.
      </p>
      <ul className="mt-10 space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/40">
              <time dateTime={post.date} className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">By {post.author}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Read article →
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
