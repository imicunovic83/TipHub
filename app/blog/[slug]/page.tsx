import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { getMatchById, getTeamByCode, getTipsByMatch } from "@/lib/data";
import { getMergedTipsters } from "@/lib/merged-data";
import SectionTitle from "@/components/SectionTitle";
import ShareButton from "@/components/ShareButton";
import TipCard from "@/components/TipCard";

const TRUSTED_MIN_RESOLVED = 10;
const TRUSTED_MIN_WIN_RATE = 55;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);

  const relatedMatch = post.relatedMatchId ? getMatchById(post.relatedMatchId) : undefined;
  const home = relatedMatch ? getTeamByCode(relatedMatch.homeCode) : undefined;
  const away = relatedMatch ? getTeamByCode(relatedMatch.awayCode) : undefined;
  const matchTips = relatedMatch ? getTipsByMatch(relatedMatch.id) : [];

  // If the post is authored by a real tipster (matched by display name) with
  // a strong track record, surface a "Trusted" pill + a one-line stats hint.
  const tipsters = await getMergedTipsters();
  const authorTipster = tipsters.find(
    (t) => !t.isDemo && t.name.toLowerCase() === post.author.toLowerCase(),
  );
  const isTrustedAuthor =
    !!authorTipster &&
    authorTipster.totalTips >= TRUSTED_MIN_RESOLVED &&
    authorTipster.winRate >= TRUSTED_MIN_WIN_RATE;

  return (
    <section className="pad-section">
      <div className="container">
        <nav className="back-nav">
          <Link href="/blog">← Back to blog</Link>
        </nav>

        <article className="blog-post">
          <header className="blog-post-header">
            <div className="blog-card-meta">
              <span className="blog-kind-pill">
                {post.kind === "match-preview" ? "Match preview" : "Article"}
              </span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>· {post.readingMinutes} min read</span>
            </div>
            <h1 className="title-display">{post.title}</h1>
            <p className="blog-post-lede">{post.description}</p>
            <div className="blog-post-byline">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                By{" "}
                {authorTipster ? (
                  <Link href={`/tipsters/${authorTipster.slug}`} className="text-link">
                    <strong>{post.author}</strong>
                  </Link>
                ) : (
                  <strong>{post.author}</strong>
                )}
                {isTrustedAuthor ? (
                  <span
                    className="trusted-pill"
                    title={`Lifetime ${authorTipster.winRate}% wins on ${authorTipster.totalTips} tips`}
                  >
                    ★ Trusted · {authorTipster.winRate}% · {authorTipster.totalTips} tips
                  </span>
                ) : null}
              </span>
              <ShareButton path={`/blog/${post.slug}`} />
            </div>
          </header>

          {post.coverImage ? (
            <div className="blog-post-cover">
              <Image
                src={post.coverImage}
                alt=""
                width={1200}
                height={630}
                priority
                className="blog-post-cover-img"
              />
            </div>
          ) : null}

          {relatedMatch && home && away ? (
            <div className="surface blog-post-match-info">
              <span className="eyebrow">Match in focus</span>
              <h2 className="surface-title">
                {home.name} vs {away.name}
              </h2>
              <p className="text-muted-sm" style={{ margin: 0 }}>
                Group {relatedMatch.group} · {relatedMatch.stadium}, {relatedMatch.city} ·{" "}
                {formatDate(relatedMatch.kickoffISO)}
              </p>
            </div>
          ) : null}

          <div className="blog-post-content">
            <Post />
          </div>

          {post.tags.length ? (
            <div className="blog-post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag-pill">#{tag}</span>
              ))}
            </div>
          ) : null}
        </article>

        {relatedMatch && matchTips.length ? (
          <div className="stack" style={{ marginTop: "3rem" }}>
            <SectionTitle
              eyebrow="All tips on this match"
              title={`${home?.name} vs ${away?.name}`}
              description="Every active pick from our community on this fixture."
            />
            <div className="grid-cards">
              {matchTips.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
