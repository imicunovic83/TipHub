import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <p className="site-footer-copy">© 2026 TipHub — Free tipster community with transparent track records</p>
        <p className="site-footer-disclaimer">
          18+ only. Gambling can be addictive — gamble responsibly.
        </p>
        <p className="site-footer-disclaimer">
          <Link href="/blog" className="text-link">Blog</Link>
          {" · "}
          <a href="/feed.xml" className="text-link">RSS feed</a>
        </p>
      </div>
    </footer>
  );
}
