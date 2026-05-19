import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import SectionTitle from "@/components/SectionTitle";

const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Editorial breakdowns, match previews, and tipster guides from the TipHub community. Written and updated weekly.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "TipHub blog",
    description:
      "Match previews, tipster guides, and editorial from the TipHub community.",
    url: "/blog",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1),
    totalPages,
  );
  const start = (page - 1) * PAGE_SIZE;
  const slice = posts.slice(start, start + PAGE_SIZE);

  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Blog"
          title="Match previews & editorial"
          description="Long-form breakdowns of the matches our community is most active on, plus guides on how to use TipHub and stay sharp."
        />

        {posts.length === 0 ? (
          <div className="surface">
            <p className="text-muted" style={{ margin: 0 }}>
              No posts yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {slice.map((post) => (
                <article key={post.slug} className="blog-card">
                  <Link href={`/blog/${post.slug}`} className="blog-card-link">
                    {post.coverImage ? (
                      <div className="blog-card-cover">
                        <Image
                          src={post.coverImage}
                          alt=""
                          width={1200}
                          height={630}
                          className="blog-card-cover-img"
                        />
                      </div>
                    ) : (
                      <div className="blog-card-cover blog-card-cover--placeholder" aria-hidden="true">
                        <span>TipHub</span>
                      </div>
                    )}
                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span className="blog-kind-pill">
                          {post.kind === "match-preview" ? "Match preview" : "Article"}
                        </span>
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      </div>
                      <h2 className="blog-card-title">{post.title}</h2>
                      <p className="blog-card-desc">{post.description}</p>
                      <div className="blog-card-footer">
                        <span>By {post.author}</span>
                        <span>{post.readingMinutes} min read</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className="blog-pagination" aria-label="Blog pagination">
                {page > 1 ? (
                  <Link
                    href={page - 1 === 1 ? "/blog" : `/blog?page=${page - 1}`}
                    className="btn btn-ghost"
                  >
                    ← Newer
                  </Link>
                ) : <span />}
                <span className="text-muted">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link href={`/blog?page=${page + 1}`} className="btn btn-ghost">
                    Older →
                  </Link>
                ) : <span />}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
