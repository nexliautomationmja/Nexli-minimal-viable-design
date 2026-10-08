# Advisory funnel — launch setup

Everything outside the codebase that has to exist before this funnel can run.

## The flow

```
Ad → /advisory-pricing (opt-in)
       → /advisory-pricing/vsl        the Better Clients VSL, gated on the opt-in cookie
       → /advisory-pricing/qualify    six questions
            ├─ qualified   → /advisory-pricing/call        book the growth call
            └─ not a fit   → /advisory-pricing/offer       the $297 Accelerator (downsell)
                                → Stripe → /advisory-pricing/next-steps
```

**The $297 is the downsell, not the gate.** Nothing between the opt-in and the calendar costs money. A firm that clears the bar books without ever paying; a firm that misses it is offered the Accelerator, which is where the funnel recovers ad spend from traffic it would otherwise drop.

---

## 1. Vercel environment variables (Production)

| Variable | Value |
|---|---|
| `STRIPE_ADVISORY_PRICE_ID` | `price_1UNWZHQ5JX5LVmTlgRvBBjFJ` — **live** price under `prod_VOJBkEQoLN3nvQ` |
| `GHL_ADVISORY_OPTIN_WEBHOOK_URL` | workflow 1 |
| `GHL_ADVISORY_QUALIFY_WEBHOOK_URL` | workflow 2 |
| `GHL_ADVISORY_BOOKING_WEBHOOK_URL` | workflow 3 |
| `GHL_ADVISORY_CHECKOUT_WEBHOOK_URL` | workflow 4 |
| `GHL_ADVISORY_PURCHASE_WEBHOOK_URL` | workflow 5 — **required**, the only delivery path for the PDF |

> The local `.env.local` holds the **test** price `price_1UNWedQ5JX5LVmTlBviMxFsI`. Never put the live price there — a live price id against a test key fails every checkout.

Still outstanding: the live-mode Stripe switch (live secret key, live webhook endpoint at `https://www.nexli.net/api/stripe/webhook`, a Terms of Service URL set in Stripe, and `STRIPE_SKIP_TOS_CONSENT` removed).

---

## 2. GoHighLevel

### Tags the site applies by API

The site writes these onto the contact directly. Do **not** build workflows that fight them.

| Tag | Applied when |
|---|---|
| `advisory opt-in` | opt-in form submitted, **and** on every qualifier submission |
| `advisory qualified` | cleared the six questions |
| `advisory not a fit` | missed the bar |
| `advisory buyer` | the $297 payment succeeds — and `advisory opt-in` is removed in the same call |
| `call booked` | booked the growth call |

> **`advisory opt-in` is the qualifier's base tag now, not `advisory buyer`.** Almost everyone reaching the qualifier has paid nothing. Tagging them as buyers would drop them out of every pre-purchase sequence, since all of those are gated on that tag being absent — and the downsell would never reach the people it exists for.

### Custom fields

| Field | Type | From |
|---|---|---|
| `firm_name` | Text | every payload |
| `resume_url` | Text | opt-in — one-click link back into the gated VSL |
| `lead_score` | Text | opt-in, qualifier |
| `funnel_path` | Text | qualifier, booking |
| `annual_revenue_label` | Text | qualifier |
| `tax_savings_label` | Text | qualifier |
| `decision_role_label` | Text | qualifier |
| `goal_label` | Text | qualifier |
| `booking_start` | Text | booking |
| `stripe_session_id` | Text | purchase |
| `access_url` | Text | purchase |

### Merge-field casing — read this before copying anything

The **opt-in** webhook sends `snake_case` (`{{inboundWebhookRequest.first_name}}`). **Every other** webhook here sends `camelCase` (`firstName`). Copying merge tags between workflows renders them blank. The five email templates in `email-templates/` are built for the opt-in webhook.

---

### Workflow 1 · `Advisory - Opt-In - Watch the Training`

Fires on opt-in. Its job is to get them to watch the VSL and reach the qualifier.

**Payload** — `source, tag, lead_id, lead_score, first_name, last_name, email, phone, firm_name, resume_url, marketing_sms_opt_in, non_marketing_sms_opt_in, utm_*, fbclid, landing_page, referrer, submitted_at`

- Create/Update Contact on `email` → map `first_name`, `last_name`, `phone`, `firm_name`, `lead_score`, `resume_url`
- Pipeline → **New Lead**
- The five `accelerator-nurture-*.html` templates, in order, each gated on **`advisory qualified` and `advisory not a fit` both absent** — they all CTA to `{{inboundWebhookRequest.resume_url}}`, which lands on the gated VSL
- Paste them into a **code / custom HTML block**, not the rich-text body. GHL's WYSIWYG rewrites the markup and flattens the type.

> **A2P:** `marketing_sms_opt_in` is unticked by default and is the only consent that permits marketing SMS. `non_marketing_sms_opt_in` covers transactional only. Gate every marketing SMS step on `marketing_sms_opt_in = true` — TCPA, not preference.

### Workflow 2 · `Advisory - Qualifier - Route`

**The most important workflow in the funnel now.** It is what turns a free lead into a booked call.

**Payload** — `source, tag, funnel_path, qualified, lead_id, firstName, lastName, email, phone, firm_name, us_based, decision_role(+_label), goal(+_label, _tag), problem_duration(+_label), annual_revenue(+_label), tax_savings(+_label, _tag), lead_score, utm_*, fbclid, landing_page, submitted_at`

Branch on `qualified`:

- **`true`** → Pipeline **Qualified**; internal notification carrying `annual_revenue_label`, `tax_savings_label`, `decision_role_label` so the call is prepped; then **if `call booked` is absent**: email the booking link at 2h, SMS at 1 day, final email at 3 days. This is the sequence the whole model rests on.
- **`false`** (`funnel_path = not-a-fit`) → Pipeline **Not A Fit**; **no booking pressure, ever**. They were told no; the calendar is not offered. Sell the Accelerator instead: `access_url` is not available yet, so link them to `/advisory-pricing/offer` — the page names their rejection reason itself. Re-entry trigger for when they cross $400K.

### Workflow 3 · `Advisory - Booking - Confirm and Remind`

**Payload** — `source, tag, funnel_path, qualified, lead_id, firstName, lastName, email, phone, firm_name, booking_uid, booking_start, submitted_at`

- Pipeline → **Call Booked**
- Confirmation email + SMS immediately (transactional — permitted under `non_marketing_sms_opt_in`)
- 24h before `booking_start` → reminder email + SMS; 1h before → final SMS
- 30 min after, no-show → "we missed you" + rebooking link

> Show rate is the soft spot in this funnel: nobody paid to get here, so bookings no-show more than they did when the $297 gated the calendar. These reminders are the mitigation — build them, do not skip them.

### Workflow 4 · `Advisory - Checkout Started - Abandoned Cart`

Fires when the $297 button is clicked, before payment.

**Payload** — `firstName, lastName, email, phone, firm_name, offer_url, source, stage, product, amount, utm_*, fbclid, landing_page, lead_id, submitted_at`

- Wait 30 min → **if `advisory buyer` absent** → email with `offer_url` to resume
- Wait 1 day → final nudge → exit

### Workflow 5 · `Advisory - Purchase - Deliver the Accelerator`

There is no download button on the site, so **this email is the product delivery.** If it does not fire, a paying customer receives nothing.

**Payload** — `firstName, lastName, email, phone, firm_name, source, stage, tag, product, amount, currency, stripe_session_id, stripe_payment_intent_id, access_url, utm_*, fbclid, landing_page, purchased_at`

- Pipeline → **Customer**
- **Send email immediately**, with `Nexli-Book-of-Business-Accelerator.pdf` attached from the GHL media library
- Include `access_url` as a backup link — it works on a device that has never visited, because it mints a session from the Stripe id. Corporate mail filters strip attachments, and accounting firms are where that happens.
- Internal notification: name, firm, amount
- Wait 1 day → "did you pull your top 20 yet?"
- **No qualifier nudge here.** Everyone buying this has already been through the qualifier and been told they are not a fit. Pushing them back at it would send them into a gate they just failed.

---

## 3. Order of operations

1. Create workflows 1–3 and copy their webhook URLs — those carry the main path.
2. Create workflows 4–5; upload the PDF to the GHL media library and attach it in 5.
3. Paste all five URLs plus the live `STRIPE_ADVISORY_PRICE_ID` into Vercel Production.
4. Do the Stripe live-mode switch.
5. Redeploy.
6. Walk the funnel yourself: opt in, watch the VSL, qualify **as a fit** and confirm the call books and the reminders land. Then qualify **as not a fit** (answer under $400K) and run one live $297 purchase on a card you control, refund it, and confirm the attachment arrives, `advisory_purchased_at` is stamped, and `Purchase` shows once in Meta Events Manager.

## 4. Also verify

- Production DB has `advisory_purchased_at` and `advisory_amount_cents` — run `scripts/add-advisory-purchase-columns.sql`, which is idempotent.
- `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` are set, or ad reporting is blind.
- After deploying, fetch `/api/advisory-pricing/download` once as a buyer. The PDF lives outside `public/` and relies on `outputFileTracingIncludes`; that only fails in production.
- Optional cleanup: strip `advisory opt-in` from existing contacts that also carry `advisory buyer`, and clear the stray `preview@nexli.local` purchase row.
