import { getPostBySlug, getPostSlugs, SITE_URL } from "@/lib/blog";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

function absoluteOgImage(ogImage: string) {
  if (ogImage.startsWith("http")) return ogImage;
  return new URL(ogImage, SITE_URL).toString();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };

  const { meta } = post;
  const canonical = `${SITE_URL}/blog/${meta.slug}`;
  const ogUrl = absoluteOgImage(meta.ogImage);

  return {
    title: meta.title,
    description: meta.description,
    authors: [{ name: meta.author }],
    alternates: { canonical },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: "Salary Reality",
      type: "article",
      publishedTime: meta.date,
      authors: [meta.author],
      images: [{ url: ogUrl, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogUrl],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { meta, content } = post;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="border-b border-border pb-8">
        <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
          ← All posts
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{meta.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{meta.description}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          <time dateTime={meta.date}>
            {new Date(meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {" · "}
          {meta.author}
        </p>
      </header>
      <div
        className="prose prose-lg mt-10 max-w-none prose-headings:scroll-mt-24 prose-headings:font-serif prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-primary prose-pre:bg-card prose-pre:border prose-pre:border-border prose-th:border-border prose-th:bg-secondary prose-th:text-foreground prose-td:border-border prose-td:text-muted-foreground"
      >
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </div>
      <footer className="mt-12 rounded-xl border border-primary/30 bg-card p-6 text-center">
        <p className="text-lg text-foreground">
          See real salary data at{" "}
          <a href="https://salary.relova.ai" className="font-semibold text-primary hover:underline">
            salary.relova.ai →
          </a>
        </p>
      </footer>
    </article>
  );
}
