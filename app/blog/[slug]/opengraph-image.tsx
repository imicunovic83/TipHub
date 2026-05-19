import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

export const alt = "Blog post preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "linear-gradient(135deg, #022c22 0%, #047857 60%, #065f46 100%)";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {SITE_NAME}
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          color: "#fffbeb",
          background: BG,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#a7f3d0",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: "linear-gradient(135deg, #064e3b, #022c22)",
                color: "#fde68a",
                fontWeight: 800,
                fontSize: 32,
              }}
            >
              T
            </div>
            <span style={{ color: "#ffffff", fontSize: 30 }}>{SITE_NAME}</span>
          </div>
          <span>{post.kind === "match-preview" ? "Match preview" : "Article"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "60px" }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            {post.title}
          </div>
          <div style={{ fontSize: 28, color: "#a7f3d0", lineHeight: 1.35, maxWidth: 980 }}>
            {post.description}
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#a7f3d0",
            paddingTop: "32px",
          }}
        >
          <span>By {post.author}</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
