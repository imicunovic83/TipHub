import SectionTitle from "@/components/SectionTitle";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPage() {
  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <SectionTitle
          eyebrow="Reset password"
          title="Reset your password"
          description="Enter your email and we'll send a password reset link."
        />

        <div className="panel" style={{ marginTop: "2rem" }}>
          <ForgotPasswordForm />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Remembered your password? <Link href="/login">Log in here.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
