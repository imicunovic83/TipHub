import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-col">
            <p className="site-footer-heading">Newsletter</p>
            <p className="site-footer-blurb">
              One weekly digest of the sharpest tips, match previews and tipster news.
              No spam, unsubscribe with one click.
            </p>
            <NewsletterSignup variant="footer" />
          </div>

          <div className="site-footer-col">
            <p className="site-footer-heading">Explore</p>
            <nav className="site-footer-nav">
              <Link href="/tips">Tips</Link>
              <Link href="/tipsters">Tipsters</Link>
              <Link href="/competition">Community</Link>
              <Link href="/bookmakers">Bookmakers</Link>
              <Link href="/blog">Blog</Link>
              <a href="/feed.xml">RSS feed</a>
            </nav>
          </div>

          <div className="site-footer-col">
            <p className="site-footer-heading">Legal</p>
            <nav className="site-footer-nav">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
              <Link href="/responsible-gambling">Responsible gambling</Link>
            </nav>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copy">© 2026 TipHub — Free tipster community with transparent track records</p>
          <p className="site-footer-disclaimer">
            18+ only. Gambling can be addictive — gamble responsibly.{" "}
            <Link href="/responsible-gambling" className="text-link">Get help</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
