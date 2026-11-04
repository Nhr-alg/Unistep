# UniStep — validation site

A standalone landing page + waitlist for testing demand before building the paid product. It does not touch the calculator prototype in the parent folder; the prototype is served at `/demo/` so visitors can try it. For the beginner-friendly publishing and business steps, see `../PUBLISH.md`.

## Run it

```powershell
cd C:\Users\acer\supercalculator\site
node server.js
```

- Landing page: http://localhost:8090
- Prototype: http://localhost:8090/demo/
- Direct track links: `/?for=students`, `/?for=tutors`, `/?for=fe`
- Health check: http://localhost:8090/healthz

No dependencies, no build step. Node 18+.

## Measure it

```powershell
node report.js
node report.js --json
```

Prints visitors, signups, signup rate, and pre-order clicks per track, plus the latest signups and the decision targets from `VALIDATION.md`. Set `DATA_DIR` to the same mounted disk path the server uses when running in production.

Data lives in `site/data/` by default (or `DATA_DIR` when set):

- `waitlist.jsonl` — one line per signup
- `events.jsonl` — page views, track switches, pre-order clicks, prototype clicks

Neither is served over HTTP (`/data/` is blocked by the server).

## Before real traffic

1. **Set the brand and contact** in `config.js`.
2. **Wire checkout or booking links** in `config.js`:
   - Create Stripe Payment Links for the paid plans and paste them into `stripeLinks`.
   - Paste a Cal.com/Calendly link into `pilotBookingUrl` for tutor pilots.
   - Until they are set, pre-order clicks are recorded and the visitor is routed to the waitlist. That is still useful intent data, but real links convert better.
3. **Change the placeholder domain** in `privacy.html` / `terms.html` if you rename the product.
4. **Read `VALIDATION.md`** and set your channels and targets.

## Deploy

Any Node host works (Render, Railway, Fly, a VPS). Example for Render:

1. Push the repo (or just `site/`) to GitHub.
2. New Web Service → root directory `site`.
3. Build command: none. Start command: `node server.js`.
4. Add a persistent disk and point `DATA_DIR` at it (for example `DATA_DIR=/var/data/unistep`). Keep that folder outside the public `site/` tree. If the plan has no disk, `data/` is wiped on redeploy, so download the JSONL files before each deploy.

If you prefer a static host, deploy `index.html`, `styles.css`, `app.js`, `config.js`, `legal.js`, `privacy.html`, `terms.html` to Netlify/Cloudflare Pages and replace `/api/waitlist` and `/api/event` with a serverless function or a form service. The report script expects the JSONL format, so adapt it accordingly.

Optional: set `WAITLIST_WEBHOOK_URL` to forward each signup to a Google Sheet/Zapier/Make webhook. Optional: `TRUST_PROXY=1` when running behind a proxy so rate limiting sees the visitor IP. Optional: `DATA_DIR=/persistent/path` to keep accounts, archives, and signups on a mounted disk outside the public `site/` tree.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page with three audience tracks |
| `styles.css` | All styling, no build step, no external fonts |
| `app.js` | Track switching, pricing, waitlist, event tracking |
| `config.js` | Brand, contact, Stripe/booking links |
| `server.js` | Static server, waitlist API, event API, security headers |
| `report.js` | Funnel report per track |
| `privacy.html`, `terms.html`, `legal.js` | Policy pages (templates — have them reviewed before charging money) |
| `VALIDATION.md` | Hypotheses, channels, targets, decision rules |
| `outreach.md` | Ready-to-send posts and emails |

## Security notes

- Strict CSP, no inline scripts or styles, no third-party JS.
- Waitlist and event endpoints validate input, cap body size, and rate limit per IP.
- No IP addresses are stored; the visitor ID is a random local value.
- `/data/` and server-side files are not served.
- The app is a beta gate, not a bank: if this becomes a real product, move auth, entitlements, and billing webhooks to a proper backend before taking recurring payments.

## Known limits

- Data is JSONL on disk. Fine for a few thousand signups; move to Postgres before scaling.
- Rate limiting is in-memory, so it resets on restart and is per-instance.
- Payment links are external; there is no webhook or entitlement check yet. That is deliberate for the validation phase.
- The calculator prototype at `/demo/` is still a demo (a handful of problem types), not the paid engine.
