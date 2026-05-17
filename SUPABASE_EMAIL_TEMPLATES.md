# Supabase email templates for TipHub

Default Supabase auth emails are unbranded and the sender ("Supabase
Auth" via `noreply@mail.app.supabase.io`) feels like spam to end users.
There are two levels of fix; do at least the first one.

## 1. Customise email content (no extra services)

In the Supabase dashboard, go to **Authentication → Email Templates**.
Paste the HTML below into each template's *Message body*. Update the
*Subject* fields too.

Supabase template variables you can use:

- `{{ .ConfirmationURL }}` — the action link
- `{{ .SiteURL }}` — your site URL
- `{{ .Email }}` — recipient address
- `{{ .Token }}` — 6-digit OTP (alternative to magic link)
- `{{ .TokenHash }}` — token hash for PKCE flow

### Confirm signup

Subject: `Confirm your TipHub account`

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#022c22;padding:40px 20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
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
            <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Confirm your email</h2>
            <p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              Thanks for joining TipHub! Click the button below to verify your email so you
              can save favourites, join the community competition, and apply as a tipster.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Confirm my email
              </a>
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
              If the button doesn&apos;t work, copy and paste this link into your browser:<br>
              <span style="color:#475569;word-break:break-all;">{{ .ConfirmationURL }}</span>
            </p>
            <p style="margin:24px 0 0;font-size:13px;color:#64748b;">
              If you didn&apos;t sign up for TipHub, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
            © 2026 TipHub · 18+ only · Sample odds shown for demonstration.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

### Reset password

Subject: `Reset your TipHub password`

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#022c22;padding:40px 20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
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
            <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h2>
            <p style="margin:0 0 16px;line-height:1.5;font-size:15px;color:#334155;">
              We received a request to reset the password for your TipHub account. Click below
              to choose a new password. The link expires in one hour.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="{{ .ConfirmationURL }}"
                 style="display:inline-block;padding:14px 28px;background:#047857;color:#ffffff;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
                Choose a new password
              </a>
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
              If the button doesn&apos;t work, copy and paste this link into your browser:<br>
              <span style="color:#475569;word-break:break-all;">{{ .ConfirmationURL }}</span>
            </p>
            <p style="margin:24px 0 0;font-size:13px;color:#64748b;">
              If you didn&apos;t request a password reset, ignore this email — your password
              stays the same.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
            © 2026 TipHub · 18+ only
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

### Magic Link (optional, only if you enable passwordless login)

Subject: `Your TipHub sign-in link`

Same shell as above; swap the H2 / paragraph copy for "Sign in to
TipHub" / "Click below to sign in. The link expires in one hour."

## 2. Use your own domain as the sender (recommended before launch)

While Supabase is sending from `noreply@mail.app.supabase.io`, inbox
previews will show that address even with branded HTML inside. To
truly send from `noreply@yourdomain.com`:

1. **Pick an SMTP provider** — Resend, SendGrid, Mailgun, Postmark,
   AWS SES. Resend has the simplest free tier for low volume.
2. **Verify your domain** in that provider's dashboard (SPF + DKIM
   DNS records).
3. In Supabase dashboard → **Authentication → SMTP Settings** →
   enable *Custom SMTP* and paste:
   - SMTP host/port/user/pass from your provider
   - Sender email: `noreply@yourdomain.com`
   - Sender name: `TipHub`
4. Send a test sign-up confirmation and check the inbox.

Until custom SMTP is set up, the templates above still upgrade the
email content (the only thing the user actually reads).
