import fs from "fs";
import matter from "gray-matter";
import path from "path";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://salary.relova.ai";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  slug: string;
  author: string;
  ogImage: string;
};

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): { meta: PostFrontmatter; content: string } | null {
  const fullPath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const meta = data as PostFrontmatter;
  return { meta: { ...meta, slug: meta.slug || slug }, content };
}

export function getAllPostsMeta(): PostFrontmatter[] {
  return getPostSlugs()
    .map((slug) => {
      const post = getPostBySlug(slug);
      return post?.meta ?? null;
    })
    .filter((m): m is PostFrontmatter => m !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
