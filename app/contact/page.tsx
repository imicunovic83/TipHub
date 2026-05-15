import SectionTitle from "@/components/SectionTitle";

export default function ContactPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Contact"
          title="Get in touch"
          description="Have a question about a tip, want to suggest a feature, or interested in becoming a tipster? Drop us a line."
        />

        <div className="surface">
          <h2 className="surface-title">Editorial</h2>
          <p className="text-muted">
            For editorial questions, story ideas, and corrections:{" "}
            <a href="mailto:editorial@tiphub.example" className="card-footer-cta">editorial@tiphub.example</a>
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Become a tipster</h2>
          <p className="text-muted">
            We onboard a small number of new tipsters each year. Send a write-up of your specialty, a
            sample of three recent tips, and a 12-month track record to{" "}
            <a href="mailto:tipsters@tiphub.example" className="card-footer-cta">tipsters@tiphub.example</a>.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Press &amp; partnerships</h2>
          <p className="text-muted">
            <a href="mailto:press@tiphub.example" className="card-footer-cta">press@tiphub.example</a>
          </p>
        </div>
      </div>
    </section>
  );
}
