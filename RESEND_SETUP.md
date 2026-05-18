# Resend setup for admin approve/reject notifications

When an admin approves or rejects a tipster application from `/admin`,
TipHub sends the applicant a branded email via [Resend](https://resend.com).
Without `RESEND_API_KEY` the admin flow still works — the send is skipped
and a warning is logged.

## 1. Create a Resend account and API key

1. Sign up at <https://resend.com> (free tier covers 3k emails/month).
2. In the dashboard go to **API Keys** → **Create API Key** → copy the
   `re_...` value.
3. Paste it into `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
   ```

## 2. Pick a sender address (`EMAIL_FROM`)

There are two phases:

**a) Sandbox (no domain verification needed).** Resend lets you send from
`onboarding@resend.dev` *only to the email address you signed up with*.
Useful while developing. Set:
```
EMAIL_FROM=TipHub <onboarding@resend.dev>
```

**b) Production with your own domain.** Add a domain in Resend
(**Domains → Add Domain**), copy the SPF / DKIM / DMARC DNS records into
your registrar, wait for verification, then:
```
EMAIL_FROM=TipHub <noreply@yourdomain.com>
```

Until your domain is verified, sends to *other* addresses with a
`@yourdomain.com` sender will be rejected by Resend.

## 3. Site URL for links in emails

The approval email links to `/tipster/dashboard` and rejection links to
`/apply`. To use the real production host instead of `localhost:3000`,
set:
```
NEXT_PUBLIC_SITE_URL=https://tiphub.example.com
```

## 4. Smoke test the flow

1. Restart `npm run dev` after editing `.env.local`.
2. Register a fresh user, apply as a tipster (`/apply`).
3. Sign in as the admin (`imicunovic83@gmail.com`), open `/admin`, click
   **Approve** or **Reject**.
4. Check the recipient inbox + Resend dashboard → **Logs**.

## 5. Cost

Free tier: 100 emails/day, 3,000/month, 1 verified domain. Plenty for
the current TipHub volume; upgrade only when approval rate exceeds that.
