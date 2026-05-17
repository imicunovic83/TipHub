import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <SectionTitle
          eyebrow="Reset password"
          title="Set a new password"
          description="Choose a new password for your TipHub account. The reset link from your email expires after a short while."
        />

        <div className="panel" style={{ marginTop: "2rem" }}>
          <ResetPasswordForm />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Remembered it? <Link href="/login">Log in here.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
