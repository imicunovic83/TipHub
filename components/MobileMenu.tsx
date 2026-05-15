"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import FavoritesCounter from "@/components/FavoritesCounter";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tips", label: "Tips" },
  { href: "/tipsters", label: "Tipsters" },
  { href: "/bookmakers", label: "Bookmakers" },
  { href: "/about", label: "About" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever the route changes (link click) or the user
  // resizes back to desktop.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.innerWidth > 720) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="hamburger-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={open ? "hamburger-icon is-open" : "hamburger-icon"} aria-hidden="true">
          <span /><span /><span />
        </span>
      </button>

      {open ? (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-menu-panel" role="dialog" aria-label="Site navigation">
            <form className="mobile-menu-search" action="/search" onSubmit={() => setOpen(false)}>
              <label htmlFor="mobile-search" className="sr-only">Search</label>
              <input
                id="mobile-search"
                type="search"
                name="q"
                className="input"
                placeholder="Search teams, tipsters, bookmakers..."
              />
              <button type="submit" className="btn btn-primary">Go</button>
            </form>

            <nav className="mobile-menu-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? "mobile-menu-link is-active" : "mobile-menu-link"}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mobile-menu-footer">
              <FavoritesCounter />
              <ThemeToggle />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
