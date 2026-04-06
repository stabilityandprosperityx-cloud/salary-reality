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
      <header className="border-b border-white/10 pb-8">
        <Link href="/blog" className="text-sm font-medium text-[#38BDF8] hover:underline">
          ← All posts
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{meta.title}</h1>
        <p className="mt-3 text-lg text-white/70">{meta.description}</p>
        <p className="mt-4 text-sm text-white/50">
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
        className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-white prose-a:text-[#38BDF8] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-[#38BDF8] prose-blockquote:text-white/70 prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:text-[#38BDF8] prose-pre:bg-[#12121A] prose-pre:border prose-pre:border-white/10 prose-th:border-white/20 prose-th:bg-white/5 prose-th:text-white prose-td:border-white/10 prose-td:text-white/80"
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
      <footer className="mt-12 rounded-xl border border-[#38BDF8]/30 bg-[#12121A] p-6 text-center">
        <p className="text-lg text-white">
          See real salary data at{" "}
          <a href="https://salary.relova.ai" className="font-semibold text-[#38BDF8] hover:underline">
            salary.relova.ai →
          </a>
        </p>
      </footer>
    </article>
  );
}
