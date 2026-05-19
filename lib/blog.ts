import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostKind = "article" | "match-preview";

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  author: string;
  publishedAt: string;       // ISO date (YYYY-MM-DD or full ISO)
  coverImage?: string;       // public-relative path
  relatedMatchId?: string;   // links match previews back to a Match.id
  tags: string[];
  kind: BlogPostKind;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  readingMinutes: number;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

function readFrontmatter(slug: string): BlogPost | null {
  const candidates = [
    path.join(BLOG_DIR, `${slug}.mdx`),
    path.join(BLOG_DIR, `${slug}.md`),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;

  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Partial<BlogPostFrontmatter>;

  if (!fm.title || !fm.description || !fm.author || !fm.publishedAt || !fm.kind) {
    throw new Error(`Blog post "${slug}" is missing required frontmatter`);
  }

  const words = content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 220));

  return {
    slug,
    title: fm.title,
    description: fm.description,
    author: fm.author,
    publishedAt: fm.publishedAt,
    coverImage: fm.coverImage,
    relatedMatchId: fm.relatedMatchId,
    tags: fm.tags ?? [],
    kind: fm.kind,
    readingMinutes,
  };
}

export function getAllPosts(): BlogPost[] {
  return readSlugs()
    .map(readFrontmatter)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return readFrontmatter(slug) ?? undefined;
}

export function getRecentPosts(limit: number): BlogPost[] {
  return getAllPosts().slice(0, limit);
}
