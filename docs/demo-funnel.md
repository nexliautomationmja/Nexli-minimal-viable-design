# The demo funnel: local end-to-end walkthrough

This walks the whole demo funnel on your machine, with real services in test mode:

**ad → /demo-opt-in → /demo → /demo/qualify → /demo/call (qualified) or /demo/offer (everyone else) → Stripe → /demo/thank-you → portal provisioning.**

Nothing here touches production. Stripe runs in test mode, and the database is a Neon branch.

It replaces the retired `/foundation` funnel (pitch page → six questions → a website preview generated from the prospect's own site). `/foundation`, `/foundation/start` and `/foundation/preview/*` now 308 to `/demo-opt-in`; `/foundation/thank-you` goes to `/demo/thank-you`.

---

## 1. One-time setup

Everything runs with Node 22 at `~/.local/node/bin`. Open two terminals in the repo root and prefix commands with `PATH=~/.local/node/bin:$PATH` (or add it to your shell profile).

### 1.1 Database branch

In the Neon console, create a **branch** of the production database and copy its connection string. A branch starts as a copy of production, so the existing admin user and any real data are there, but nothing you do affects the live database.

### 1.2 Env files

Copy the templates and fill in the blanks. Both files are gitignored.

```bash
cp .env.local.example .env.local
cp /Users/marcel/nexli-portal/.env.local.example /Users/marcel/nexli-portal/.env.local
```

Root `.env.local`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Neon branch connection string |
| `DEMO_SESSION_SECRET` | `openssl rand -hex 32` — signs the cookie that carries the lead from `/demo-opt-in` through to checkout |
| `STRIPE_SECRET_KEY` | your Stripe **test** secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | leave blank for now; step 1.5 prints it |
| `STRIPE_FOUNDATION_PRICE_ID` | leave blank for now; step 1.4 prints it ($497/mo) |
| `STRIPE_FOUNDATION_SETUP_PRICE_ID` | leave blank for now; step 1.4 prints it ($999 one-time) |
| `STRIPE_SKIP_TOS_CONSENT` | `1` (demo only; remove after setting a Terms URL in Stripe) |
| `DASHBOARD_INTERNAL_URL` | `http://localhost:3001` |
| `PROVISION_SECRET` | any long random string |
| `GHL_API_KEY` | a Private Integration token (`pit-...`) — see section 4 |
| `GHL_LOCATION_ID` | the sub-account id — see section 4 |
| `GHL_CUSTOM_FIELD_IDS` | optional; printed by the script in section 4 |
| `GHL_DEMO_OPTIN_WEBHOOK_URL` | optional inbound webhook fired on opt-in |
| `GHL_DEMO_QUALIFY_WEBHOOK_URL` | optional inbound webhook fired after the six questions |
| `GHL_DEMO_BOOKING_WEBHOOK_URL` | optional inbound webhook fired when a qualified firm books |
| `ANTHROPIC_API_KEY` | optional; the demo sandbox shows one fixed firm, so nothing in the funnel needs it |

Portal `/Users/marcel/nexli-portal/.env.local` (the real portal repo; the `dashboard/` folder in this project is a stale copy and is no longer used):

| Variable | Value |
|---|---|
| `DATABASE_URL` | the same Neon branch string |
| `NEXTAUTH_URL` | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
| `NEXT_PUBLIC_PORTAL_URL` | `http://localhost:3001` |
| `MARKETING_SITE_URL` | `http://localhost:3000` |
| `PROVISION_SECRET` | the same string as the root file |
| `NEXLI_ADMIN_EMAIL` | `mail@nexli.net` |
| `ADMIN_INITIAL_PASSWORD` | the admin password you want locally |
| `RESEND_API_KEY` | your Resend key, so the emails arrive |
| `RESEND_FROM_EMAIL` | a verified Resend sender |
| `ANTHROPIC_API_KEY` | your Anthropic key, so Claude writes site copy |

### 1.3 Apply the database scripts

Run the SQL files against the branch (the first two are the marketing app's, the last two the portal's). The runner uses the Neon driver, so no `psql` is needed. All of them are idempotent.

```bash
node scripts/demo/run-sql.mjs scripts/add-foundation-columns.sql --env .env.local
node scripts/demo/run-sql.mjs scripts/add-setup-fee-columns.sql --env .env.local
node scripts/demo/run-sql.mjs /Users/marcel/nexli-portal/scripts/add-foundation-tier.sql --env /Users/marcel/nexli-portal/.env.local
node scripts/demo/run-sql.mjs /Users/marcel/nexli-portal/scripts/add-firm-sites.sql --env /Users/marcel/nexli-portal/.env.local
```

`add-setup-fee-columns.sql` is the new one: it adds `leads.setup_fee_cents`, `leads.first_payment_cents`, `leads.funnel_path` (`agency` or `web`) and `leads.ghl_contact_id`.

Then make sure the admin user exists (or reset its password to the one in the env file):

```bash
(cd /Users/marcel/nexli-portal && node scripts/demo/seed-admin.mjs --env .env.local --reset-password)
```

### 1.4 Stripe test product

Creates "Firm Foundation (test)" with a $497/month price and the $999 one-time setup price, or reuses them if they exist.

```bash
node scripts/demo/create-stripe-test-product.mjs --env .env.local
```

Paste the printed `STRIPE_FOUNDATION_PRICE_ID` and `STRIPE_FOUNDATION_SETUP_PRICE_ID` into the root `.env.local`.

### 1.5 Stripe CLI and webhook forwarding

Install the CLI without Homebrew:

```bash
bash scripts/demo/install-stripe-cli.sh
```

In a terminal that stays open for the whole demo:

```bash
~/.local/bin/stripe listen --api-key sk_test_YOUR_KEY --forward-to localhost:3000/api/stripe/webhook
```

It prints a signing secret starting with `whsec_`. Paste it into `STRIPE_WEBHOOK_SECRET` in the root `.env.local`.

### 1.6 Start both apps

Env changes only load on start, so restart the marketing site and start the portal:

```bash
# terminal A, repo root
npm run dev              # marketing site on http://localhost:3000

# terminal B, the portal repo
cd /Users/marcel/nexli-portal && PORT=3001 npm run dev   # portal on http://localhost:3001
```

---

## 2. The click path

Use a fresh email address you can read for the buyer. Every step below is something a real firm owner would do after clicking the ad.

### Step 1: The opt-in — `/demo-opt-in`

1. Open http://localhost:3000/demo-opt-in. This is the ad's landing page: one promise ("get instant guest access to test-drive our CPA portal") and one short form — name, email, phone, firm name.
2. Submit. The app creates a lead (`form_source = demo-optin`), sets the signed demo-session cookie (`DEMO_SESSION_SECRET`), fires the Meta **Lead** event, upserts the GoHighLevel contact and tags it **`demo opt-in`**.
3. If `GHL_DEMO_OPTIN_WEBHOOK_URL` is set, GHL also received the inbound webhook and can start the nurture sequence.
4. You land on `/demo`.

### Step 2: The demo — `/demo`

1. This is the payoff: a clickable, fully interactive sandbox of the portal for the fixed demo firm (Evergreen Tax & Advisory) plus its website, side by side in a browser frame. Nothing here is generated per-visitor — every prospect sees the same firm, so the page is instant.
2. Below it is the ~5 minute bridge video, **The Revenue Gap**: the argument for trading $800 tax filers for $15,000 advisory retainers. The button under it goes to the qualifier.

### Step 3: The qualifier — `/demo/qualify`

1. The same six questions the booking funnel has always asked: US based → decision role → primary goal → how long it has been a problem → annual revenue → biggest tax saving.
2. Nobody is thrown out of the funnel. The answers decide which offer they see:
   - **qualified** (US based, decision maker, $400K+ revenue) → `/demo/call`, tagged **`agency pitch`**
   - **everyone else** → `/demo/offer`, tagged **`web pitch`**
3. The answers are written onto the GoHighLevel contact as custom fields *and* as a note (section 4). `leads.funnel_path` records which side they landed on.

### Step 4A: The call — `/demo/call` (qualified)

1. The offer video, **The Advisory Engine**, then the Cal.com calendar inline on the page.
2. Booking tags the contact **`call booked`** and fires `GHL_DEMO_BOOKING_WEBHOOK_URL` if set.

### Step 4B: The offer — `/demo/offer` (not qualified)

1. The self-serve pitch: the same website + client portal they just played with, **$999 setup + $497/month**.
2. Clicking through creates a Stripe Checkout session carrying both prices, and `stripe listen` forwards the `checkout.session.completed` event to `/api/stripe/webhook`.
3. Use card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

### Step 5: Thank you — `/demo/thank-you`

1. The webhook recorded the subscription, fired the Meta purchase events, tagged the contact **`foundation customer`**, and called the portal's `/api/internal/provision`.
2. The page tells the buyer to look for two emails (agreement to e-sign, set-password link) and explains their two logins.

### Step 6: The two emails

With Resend configured, the buyer inbox receives:

- **Firm Foundation Service Agreement**, a link to review and e-sign through the portal.
- **Welcome to Firm Foundation**, with the set-password link for their firm dashboard and the "your two logins" explanation.

Without Resend: log in as admin (next step) and use the **Copy agreement link** and **Copy set-password link** buttons on the firm's card.

### Step 7: Your admin view

1. Open http://localhost:3001/login and sign in as `mail@nexli.net` with `ADMIN_INITIAL_PASSWORD`.
2. Go to http://localhost:3001/dashboard/admin and select the new firm. The provisioning card shows tier, subscription status, agreement sent, welcome sent, and the website draft.

### Step 8: The buyer signs the agreement

Open the agreement link (from the email or the copy button). This is the portal's own e-signature flow, the same one the firm's clients will use. Type a name, sign. Back in admin, the card now shows the agreement as signed.

### Step 9: The buyer sets a password and sees their own dashboard

1. Open the set-password link, choose a password, and sign in at http://localhost:3001/login as the buyer.
2. This is their firm dashboard: only the firm navigation (clients, documents, engagements, invoices, tax returns, settings) plus the upgrade banner. Under **Settings** they can upload a logo and pick a color, and connect Stripe so their own clients' payments reach their bank.

### Step 10: You finish the website

1. Back in admin as `mail@nexli.net`, click **Generate website** on the firm's card to build a site from the firm's details (and, when `ANTHROPIC_API_KEY` is set, from a scrape of their current site).
2. Click **Preview**. The draft opens on the marketing site in a new tab with a "Draft preview" banner.
3. Click **Edit** to open the site editor. Change the headline, adjust a color, add or remove a service. **Save** and reload the preview.
4. Click **Publish**. Open http://localhost:3000/sites/harbor-point-cpa (the slug shown on the card). It is now live, no deploy involved.

### Step 11: The firm's own domain

1. In the site editor, set the domain to `harborpointcpa.test` and save.
2. From a terminal, simulate a request arriving on that domain:

```bash
curl -s -H "Host: harborpointcpa.test" http://localhost:3000/ | grep -o "<title>[^<]*"
```

You get the firm's page title. In production the same thing happens once the firm points its DNS at Vercel and the domain is attached to the project. To see it in a browser locally, add `127.0.0.1 harborpointcpa.test` to `/etc/hosts` and open http://harborpointcpa.test:3000.

### Step 12: The firm's login to the Nexli portal

1. Open http://localhost:3001/portal and enter the buyer email. A magic link is emailed (and printed in the dashboard terminal in development).
2. Open the link. This is the buyer as **your** client: the project card shows paid, agreement signed, website draft, website live, dashboard ready, with buttons to open their firm dashboard and view their website. Their signed agreement is under Engagements.

That is the full loop: the firm has its own branded portal for its clients, and a client login to yours where they watch the project progress.

---

## 3. What ends up in the database

| Table | Row | Notable columns |
|---|---|---|
| `leads` | one per opt-in | `form_source = 'demo-optin'`, `funnel_path` (`agency` / `web`), `lead_score`, the six answers, `ghl_contact_id` |
| `leads` | updated at checkout | `setup_fee_cents`, `first_payment_cents`, Stripe ids |

---

## 4. GoHighLevel

Two mechanisms run side by side, deliberately:

- **Inbound webhooks** (`GHL_DEMO_*_WEBHOOK_URL`) fire workflows. They do *not* write anything onto the contact record — arbitrary keys in a webhook payload only land on a contact if a workflow maps each one to a field that already exists.
- **`lib/ghl.ts` / `lib/ghl-sync.ts`** write the contact directly through the v2 API: upsert by email, add tags, append a note.

### 4.1 Create a Private Integration token

The v2 API at `services.leadconnectorhq.com` only accepts a **Private Integration token**. A classic API key (the long `eyJ...` JWT in the location settings) is a v1 credential and gets a 401 from every endpoint.

1. In GoHighLevel, go to **Settings → Private Integrations → Create new integration**.
2. Give it write scopes for **contacts**, **tags** and **notes**, plus read+write on **locations/customFields** if you want to run the script below.
3. Copy the token. It starts with `pit-`. Put it in `GHL_API_KEY`.
4. `GHL_LOCATION_ID` is the sub-account id: **Settings → Business Profile → Location ID**, or the `<id>` in `https://app.gohighlevel.com/v2/location/<id>/...`.

### 4.2 Run the custom-fields script (once)

```bash
node scripts/ghl/setup-custom-fields.mjs --env .env.local
```

It lists the location's existing contact custom fields, reuses anything that already matches by field key or name, creates the rest, prints a created/reused table, and finishes with the line to paste:

```
GHL_CUSTOM_FIELD_IDS={"nexli_us_based":"...","nexli_decision_role":"...", ...}
```

The eight fields are `nexli_us_based`, `nexli_decision_role`, `nexli_primary_goal`, `nexli_problem_duration`, `nexli_annual_revenue`, `nexli_tax_savings`, `nexli_lead_score`, `nexli_funnel_path`.

**This is an optimisation, not a requirement.** Without `GHL_CUSTOM_FIELD_IDS`, `lib/ghl.ts` falls back to sending the field *keys*, and it always writes the note — so no answer is ever lost to a misconfigured account.

### 4.3 What to expect on the contact

After a prospect walks the funnel, open them in GoHighLevel and you should see:

**Custom fields** — the eight `nexli_*` fields above, in plain English ("$1M – $5M per year", not `1m-5m`).

**Tags** — `demo opt-in` on opt-in; then `agency pitch` or `web pitch` after the qualifier; `call booked` after booking; `foundation customer` after payment.

**A note**, added every time, containing every answer:

```
Completed the booking-funnel qualifier
Firm: Harbor Point CPA

--- Qualification answers ---
US based: Yes
Decision role: I'm the sole owner — I make all the decisions
Primary goal: We need help generating new leads and finding clients
Problem duration: 6–12 months
Annual revenue: $1M – $5M per year
Biggest tax saving: $50K – $100K
Goal tag: hot_full_system
Tax planning tier: taxplan_strong

Lead score: qualified
Routed to: agency pitch (booking call)

Recorded 2026-09-29T12:00:00.000Z
```

The note is the belt-and-braces surface: even with nothing mapped in the account, a human opening the contact sees the whole picture.

### 4.4 The old booking funnel

The homepage "Book Consultation" flow had the same data-loss bug and is now fixed too. `/api/forms/qualification` used to POST the six answers to an inbound webhook with no email, phone or name attached, so GHL had nothing to hang them on. `components/QualificationProvider.tsx` now takes the attendee email out of Cal.com's `bookingSuccessful` event and POSTs it back to that route with `stage: 'booked'`; with an email present the route calls `syncContactToGhl`, which writes the contact for real. The original inbound webhook still fires, unchanged, because it is what triggers the workflows.

---

## 5. Troubleshooting

- **`/demo-opt-in` submits but the next page bounces back.** `DEMO_SESSION_SECRET` is unset or changed since the cookie was signed. Set it, restart the site, and start a fresh opt-in.
- **Checkout says it cannot start.** `STRIPE_FOUNDATION_PRICE_ID`, `STRIPE_FOUNDATION_SETUP_PRICE_ID` or `STRIPE_SECRET_KEY` is missing, or the marketing site was not restarted after editing `.env.local`.
- **Stripe returns an error about terms of service.** `STRIPE_SKIP_TOS_CONSENT=1` is not set, or the site was not restarted. In production, set a Terms of Service URL under Stripe → Settings → Public details instead.
- **The webhook shows 400 in `stripe listen`.** `STRIPE_WEBHOOK_SECRET` does not match the value `stripe listen` printed. Update it and restart the marketing site.
- **Nothing appears in GoHighLevel.** Check the marketing terminal for `[GHL]` lines. `GHL_API_KEY / GHL_LOCATION_ID not set — skipping contact sync` means the env vars are missing. A `401`/`403` means the token is not a `pit-` Private Integration token, or the integration is missing a scope. The inbound webhooks are separate: they can fire while the contact write fails, and vice versa.
- **The custom fields are empty but the note is there.** `GHL_CUSTOM_FIELD_IDS` is unset or stale, and the field-key fallback did not match the account's keys. Re-run `scripts/ghl/setup-custom-fields.mjs` and paste the new line.
- **`setup-custom-fields.mjs` exits immediately.** It refuses anything that is not a `pit-` token, and it needs `GHL_LOCATION_ID`. The message says which.
- **The firm was not created in the portal.** The portal was not running on 3001, or `PROVISION_SECRET` differs between the two env files. Fix it and reload the thank-you page; it re-runs provisioning. The admin page also has a **Create firm** button that runs the same steps by hand.
- **No emails arrive.** `RESEND_API_KEY` is missing or the sender is not verified. Use the copy-link buttons on the admin card, and read the magic link from the dashboard terminal.
- **The agreement step failed.** The admin user did not exist when the purchase happened. Run the seed step, then click **Send agreement** on the card.
- **Generate website falls back to template copy.** `ANTHROPIC_API_KEY` is missing or the request timed out. The card shows which one; **Regenerate** tries again.
- **A page on `localhost:3000` shows 404 unexpectedly.** The host is being treated as a firm domain. Add it to `NEXT_PUBLIC_OWN_HOSTS` in the root `.env.local`.
- **An old `/foundation` link 404s instead of redirecting.** `next.config.ts` redirects only load when the dev server starts. Restart it.
