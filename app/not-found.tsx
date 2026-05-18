import Link from "next/link";

export default function NotFound() {
  return (
    <section className="pad-section">
      <div className="container">
        <div className="empty-state" style={{ marginTop: "3rem" }}>
          <div className="empty-state-icon" aria-hidden="true">🔎</div>
          <p className="empty-state-title">404 — page not found</p>
          <p className="empty-state-body">
            The page you&apos;re looking for doesn&apos;t exist, or has been moved. Maybe a tip got
            taken down, or a tipster profile retired. Try one of these:
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: "1rem", gap: "0.5rem" }}>
            <Link href="/" className="btn btn-primary">Home</Link>
            <Link href="/tips" className="btn btn-ghost">Browse tips</Link>
            <Link href="/tipsters" className="btn btn-ghost">Meet the tipsters</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
