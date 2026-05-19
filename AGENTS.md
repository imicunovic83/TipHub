<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:dev-server-rules -->
# Dev server is owned by the user — do not touch it

The user runs `npm run dev` on port 3000 throughout the session and views the
app live in a browser tab. The dev server's HMR connection and in-memory chunk
hashes are stateful — disturbing them invalidates the browser tab and the user
sees an unstyled / broken page until they manually clear cache and refresh.

**Forbidden during a session:**
- `npm run dev` (a second one — Next 16 has a per-dir lock that will silently kill the user's)
- `rm -rf .next` or any deletion of `.next/` (wipes the cache the user's server is actively serving from)
- `npm run build` (overwrites `.next/` dev artifacts; rebuilds chunks with new hashes that the user's browser can't find)
- Blanket `Stop-Process -Name node` / `taskkill` of node processes (kills the user's dev along with any of mine)

**How to verify changes instead:**
- `curl http://localhost:3000/<path>` — read-only, doesn't disturb the dev server. Use it to confirm rendering, status codes, content.
- `npx tsc --noEmit` — doesn't touch `.next/`, validates types in isolation.
- `npm run test:e2e` — Playwright spins up its own dev server on port 3100 with a separate webserver; safe.

**If a check truly requires a production build** (rare — usually only for diagnosing a prod-only bug), warn the user first and let them stop their dev before running it. Do not run `next build` silently.

**If no dev server is running at session start** (curl localhost:3000 returns connection refused), you may run `npm run dev` in the background once and leave it running for the rest of the session. Don't restart it.
<!-- END:dev-server-rules -->
