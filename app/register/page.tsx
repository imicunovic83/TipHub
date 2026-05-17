import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <SectionTitle
          eyebrow="Sign up"
          title="Create your TipHub account"
          description="Register to save your favorite tips, follow tipsters and get the latest World Cup 2026 odds and predictions."
        />

        <div className="panel" style={{ marginTop: "2rem" }}>
          <RegisterForm />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Already have an account? <Link href="/login">Log in here.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
