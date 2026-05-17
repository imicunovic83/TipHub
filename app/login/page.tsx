import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <SectionTitle
          eyebrow="Log in"
          title="Access your TipHub account"
          description="Sign in to manage your favorite tipsters, submit community tips and view your competition progress."
        />

        <div className="panel" style={{ marginTop: "2rem" }}>
          <LoginForm nextPath={next ?? null} />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Don&apos;t have an account yet? <Link href="/register">Create one here.</Link>
            <br />
            <Link href="/forgot">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
