import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo">
          <span className="site-logo-mark">T</span>
          TipHub
        </Link>

        <form className="header-search" action="/search">
          <label htmlFor="header-search" className="sr-only">Search tips, teams, tipsters or bookmakers</label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Search teams, tipsters, bookmakers..."
            className="input header-search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <nav className="site-nav">
          <Link href="/" className="site-nav-link">Home</Link>
          <Link href="/tips" className="site-nav-link">Tips</Link>
          <Link href="/tipsters" className="site-nav-link">Tipsters</Link>
          <Link href="/about" className="site-nav-link">About</Link>
        </nav>
      </div>
    </header>
  );
}
