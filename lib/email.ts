import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "TipHub <onboarding@resend.dev>";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

function shell(headline: string, bodyHtml: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#022c22;padding:40px 20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="padding:32px;background:linear-gradient(135deg,#064e3b,#047857);color:#ffffff;">
            <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.01em;">TipHub</h1>
            <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">World Cup 2026 expert predictions</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:#1e293b;">
            <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">${headline}</h2>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
            &copy; 2026 TipHub &middot; 18+ only &middot; Sample odds shown for demonstration.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const client = getResend();
  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set; would have sent "${subject}" to ${to}`);
    return;
  }
  const result = await client.emails.send({ from: EMAIL_FROM, to, subject, html });
  if (result.error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, result.error);
  }
}

export async function sendApplicationApprovedEmail(opts: {
  to: string;
  name: string;
}): Promise<void> {
  const name = escapeHtml(opts.name);
  const dashboard = `${siteUrl()}/tipster/dashboard`;
  const body = `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              Congratulations ${name} &mdash; your TipHub tipster application has been
              <strong>approved</strong>. You can now post tips, build your stats, and grow
              a following from your tipster dashboard.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${dashboard}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Open my tipster dashboard
              </a>
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
              If the button doesn&apos;t work, copy and paste this link into your browser:<br>
              <span style="color:#475569;word-break:break-all;">${dashboard}</span>
            </p>`;
  await send(opts.to, "Your TipHub tipster application is approved", shell("You’re in", body));
}

export async function sendApplicationReceivedEmail(opts: {
  to: string;
  name: string;
  specialty: string;
}): Promise<void> {
  const name = escapeHtml(opts.name);
  const specialty = escapeHtml(opts.specialty);
  const body = `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              Thanks ${name} — we&apos;ve received your TipHub tipster application
              (specialty: <strong>${specialty}</strong>) and it&apos;s now in the review queue.
            </p>
            <p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              An admin reviews every application by hand. We aim to get back to you within
              <strong>72 hours</strong> — you&apos;ll get an email either way, and if approved your
              account is upgraded to tipster access automatically.
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
              No action needed from you right now. While you wait, you can keep building a track
              record in the community competition.
            </p>`;
  await send(opts.to, "We received your TipHub tipster application", shell("Application received", body));
}

export async function sendNewsletterConfirmation(opts: {
  to: string;
  token: string;
}): Promise<void> {
  const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${encodeURIComponent(opts.token)}`;
  const unsubUrl = `${siteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(opts.token)}`;
  const body = `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              Thanks for signing up for the TipHub newsletter. Click the
              button below to confirm your email address &mdash; we won&apos;t
              send anything until you do.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${confirmUrl}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Confirm subscription
              </a>
            </p>
            <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.5;">
              If the button doesn&apos;t work, copy and paste this link into your browser:<br>
              <span style="color:#475569;word-break:break-all;">${confirmUrl}</span>
            </p>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
              Didn&apos;t sign up? You can ignore this email, or
              <a href="${unsubUrl}" style="color:#94a3b8;">remove your address from our list</a>.
            </p>`;
  await send(opts.to, "Confirm your TipHub newsletter subscription", shell("One more step", body));
}

export async function sendNewsletterWelcome(opts: { to: string; token: string }): Promise<void> {
  const blogUrl = `${siteUrl()}/blog`;
  const unsubUrl = `${siteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(opts.token)}`;
  const body = `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              You&apos;re in. We&apos;ll send you a short weekly digest of the most
              interesting tips, match previews, and tipster news &mdash; never
              more than once a week.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${blogUrl}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Read the latest from the blog
              </a>
            </p>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
              Change your mind? You can <a href="${unsubUrl}" style="color:#94a3b8;">unsubscribe at any time</a>.
            </p>`;
  await send(opts.to, "Welcome to the TipHub newsletter", shell("You're confirmed", body));
}

export async function sendApplicationRejectedEmail(opts: {
  to: string;
  name: string;
  note?: string;
}): Promise<void> {
  const name = escapeHtml(opts.name);
  const noteBlock = opts.note?.trim()
    ? `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;"><strong>Reviewer note:</strong><br>${escapeHtml(opts.note.trim())}</p>`
    : "";
  const apply = `${siteUrl()}/apply`;
  const body = `<p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              Hi ${name}, thanks for applying to be a TipHub tipster. After review we won&apos;t
              be moving forward with this application.
            </p>
            ${noteBlock}
            <p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              You&apos;re welcome to keep building a track record in the community competition
              and reapply later.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${apply}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Reapply later
              </a>
            </p>`;
  await send(opts.to, "Update on your TipHub tipster application", shell("Application update", body));
}
