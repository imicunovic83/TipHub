import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { getTipsByMatch, type Tip } from "@/lib/data";
import TipCard from "@/components/TipCard";

function TipsByMatch({ matchId, limit }: { matchId: string; limit?: number }) {
  const tips = getTipsByMatch(matchId);
  if (!tips.length) {
    return (
      <div className="blog-callout blog-callout--muted">
        No tips have been posted on this match yet.
      </div>
    );
  }
  const sliced = (typeof limit === "number" ? tips.slice(0, limit) : tips) as Tip[];
  return (
    <div className="blog-embed-tips">
      {sliced.map((tip) => (
        <TipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}

const components: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    if (typeof href === "string" && href.startsWith("/")) {
      return (
        <Link href={href} className="blog-link" {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className="blog-link" target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    );
  },
  TipsByMatch,
};

export function useMDXComponents(extra: MDXComponents = {}): MDXComponents {
  return { ...components, ...extra };
}
