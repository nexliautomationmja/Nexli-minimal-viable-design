# Meta Ads Lead-Quality Feedback System

## Overview

This system teaches Meta's ad algorithm to optimize for **qualified leads** instead of raw volume. It does this by:

1. **Capturing attribution** (fbclid, fbp, fbc, UTMs) on every page load and persisting it for 30 days
2. **Scoring leads** server-side as `raw`, `qualified`, or `disqualified`
3. **Deduplicating events** between browser Pixel and server-side Conversions API (CAPI) using shared `event_id`
4. **Firing lifecycle events** (BookedCall, ShowedCall, Opportunity, Purchase) from CRM webhooks so Meta learns which leads actually convert

---

## Architecture

```
Browser                          Server                          Meta
───────                          ──────                          ────
Page Load
  ├─ captureAttribution()
  ├─ fbq('init', PIXEL_ID)
  └─ fbq('track', 'PageView')

Form Submit
  ├─ trackMetaEvent('Lead',      POST /api/forms/guide
  │   params, eventId)  ────────► ├─ Validate + rate limit
  │                               ├─ Insert into leads DB
  │                               ├─ scoreLead() → 'raw'
  │                               ├─ sendCAPIEvent('Lead',  ──────► Lead (deduped
  │                               │   eventId, attribution)          by event_id)
  │                               └─ Forward to GHL webhook

Qualification Gate
  ├─ trackMetaEvent('Complete    POST /api/forms/qualification
  │   Registration', eventId) ──► ├─ Validate + rate limit
  │                               ├─ Insert into leads DB
  │                               ├─ scoreLead() → 'qualified'
  │                               ├─ sendCAPIEvent('Complete ──────► CompleteRegistration
  │                               │   Registration', eventId)        (deduped)
  │                               ├─ sendCAPIEvent('Qualified ─────► QualifiedLead
  │                               │   Lead') [server-only]           (server-only)
  │                               └─ Forward to GHL webhook

CRM Lifecycle (GHL Automations)
                                 POST /api/meta/booked-call
                                  ├─ Verify webhook secret
                                  ├─ Look up lead by email
                                  ├─ Reconstruct attribution  ──────► BookedCall
                                  └─ Update booked_call_at            (with fbp/fbc)
```

---

## File Inventory

### New Files

| File | Purpose |
|------|---------|
| `lib/attribution.ts` | Client-side attribution capture (fbclid, fbp, fbc, UTMs) |
| `lib/meta-events.ts` | Client-side Pixel helper with event_id deduplication |
| `lib/leads-schema.ts` | Drizzle schema for `leads` table |
| `lib/lead-scoring.ts` | Configurable server-side lead scoring |
| `lib/meta-capi.ts` | Server-side Meta Conversions API client |
| `lib/webhook-auth.ts` | Webhook secret verification (timing-safe) |
| `components/AttributionCapture.tsx` | Mount-once attribution capture component |
| `app/api/forms/qualification/route.ts` | Server route for qualification form |
| `app/api/forms/revenue-calc/route.ts` | Server route for revenue calculator |
| `app/api/meta/qualified-lead/route.ts` | CRM webhook → CAPI QualifiedLead |
| `app/api/meta/booked-call/route.ts` | CRM webhook → CAPI BookedCall |
| `app/api/meta/showed-call/route.ts` | CRM webhook → CAPI ShowedCall |
| `app/api/meta/opportunity/route.ts` | CRM webhook → CAPI Opportunity |
| `app/api/meta/purchase/route.ts` | CRM webhook → CAPI Purchase |
| `scripts/migrate-leads-table.sql` | Database migration SQL |
| `scripts/test-capi.sh` | Test curl commands for lifecycle endpoints |

### Modified Files

| File | Changes |
|------|---------|
| `app/layout.tsx` | Pixel ID → env var, added `<AttributionCapture />` |
| `components/QualificationProvider.tsx` | Uses server route, attribution, eventId dedup |
| `components/ContactForm.tsx` | Uses `trackLeadEvent()`, passes attribution |
| `components/FreeGuide.tsx` | Uses `trackLeadEvent()`, passes attribution |
| `components/RevenueCalculator.tsx` | Uses server route, `trackLeadEvent()`, attribution |
| `components/VslFunnel.tsx` | Uses `trackMetaEvent()` for ViewContent |
| `components/Funnel.tsx` | Uses `trackMetaEvent()` for ViewContent |
| `app/thank-you/thank-you-client.tsx` | Uses `trackMetaEvent()` with eventId |
| `app/api/forms/audit/route.ts` | Added DB insert, scoring, CAPI |
| `app/api/forms/guide/route.ts` | Added DB insert, scoring, CAPI |
| `next.config.ts` | Added `graph.facebook.com` to CSP `connect-src` |
| `.env.example` | Added Meta/CRM/GHL env vars |

---

## Environment Variables

Add these to your `.env.local` (and to Vercel environment settings for production):

```env
# Meta Pixel & Conversions API
NEXT_PUBLIC_META_PIXEL_ID=910151701422761
META_CAPI_ACCESS_TOKEN=          # Generate in Events Manager > Settings > Conversions API
META_API_VERSION=v21.0
META_TEST_EVENT_CODE=            # Set for test mode, remove for production

# CRM Webhook Security
CRM_WEBHOOK_SECRET=              # Generate with: openssl rand -hex 32

# GHL Webhooks
GHL_AUDIT_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
GHL_GUIDE_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
GHL_QUALIFICATION_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
GHL_REVENUE_CALC_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/...
```

---

## Database Setup

Run the migration in `scripts/migrate-leads-table.sql` against your Neon database:

```bash
# Via Neon console: paste the SQL
# Or via psql:
psql $DATABASE_URL < scripts/migrate-leads-table.sql
```

This creates the `leads` table with indexes on email, meta_event_id, lead_score, created_at, and fbclid.

---

## How to Get META_CAPI_ACCESS_TOKEN

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel (ID: 910151701422761)
3. Go to **Settings** tab
4. Scroll to **Conversions API** section
5. Click **Generate Access Token**
6. Copy the token to `META_CAPI_ACCESS_TOKEN` in your env

---

## Testing

### 1. Test Attribution Capture

1. Visit any page with query params: `?fbclid=test123&utm_source=facebook&utm_medium=paid`
2. Open DevTools → Application → Cookies → look for `_nexli_attr`
3. Also check `localStorage` for `nexli_attribution`

### 2. Test Browser Pixel Events

1. Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
2. Submit a form → the extension should show a Lead event with an `eventID` parameter

### 3. Test CAPI Events (Test Mode)

1. Set `META_TEST_EVENT_CODE=TEST12345` in `.env.local`
2. Submit a form
3. Go to Events Manager → **Test Events** tab
4. You should see the server-side event with the same `event_id` as the browser event

### 4. Test Deduplication

In Events Manager, browser and server events with the same `event_id` should be shown as **deduplicated** — counting as one event, not two.

### 5. Test Lifecycle Endpoints

```bash
# Set env vars
export CRM_WEBHOOK_SECRET=your-secret
export TEST_EMAIL=someone@example.com

# Run the test script
bash scripts/test-capi.sh
```

### 6. Test Webhook Security

The lifecycle endpoints should return `401 Unauthorized` without the correct `x-webhook-secret` header.

---

## Connecting GHL Lifecycle Automations

In GoHighLevel, create workflow automations that fire HTTP webhooks when a contact moves through stages:

### BookedCall
- **Trigger:** Appointment Status = "Confirmed"
- **Action:** HTTP POST to `https://www.nexli.net/api/meta/booked-call`
- **Headers:** `x-webhook-secret: <your CRM_WEBHOOK_SECRET>`
- **Body:** `{"email": "{{contact.email}}"}`

### ShowedCall
- **Trigger:** Appointment Status = "Showed" (or custom tag)
- **Action:** HTTP POST to `https://www.nexli.net/api/meta/showed-call`
- **Headers:** `x-webhook-secret: <your CRM_WEBHOOK_SECRET>`
- **Body:** `{"email": "{{contact.email}}"}`

### Opportunity
- **Trigger:** Pipeline Stage = "Opportunity" (or Opportunity Created)
- **Action:** HTTP POST to `https://www.nexli.net/api/meta/opportunity`
- **Headers:** `x-webhook-secret: <your CRM_WEBHOOK_SECRET>`
- **Body:** `{"email": "{{contact.email}}"}`

### Purchase
- **Trigger:** Pipeline Stage = "Won" or Payment Received
- **Action:** HTTP POST to `https://www.nexli.net/api/meta/purchase`
- **Headers:** `x-webhook-secret: <your CRM_WEBHOOK_SECRET>`
- **Body:** `{"email": "{{contact.email}}", "value": 5000, "currency": "USD"}`

---

## Meta Ads Manager Configuration

### 1. Domain Verification
- Go to Business Settings → Brand Safety → Domains
- Verify `nexli.net` if not already done

### 2. Aggregated Event Measurement (AEM)
- Go to Events Manager → your Pixel → Settings → Aggregated Event Measurement
- Configure event priority (highest to lowest):
  1. Purchase
  2. Opportunity
  3. ShowedCall
  4. BookedCall
  5. QualifiedLead
  6. CompleteRegistration
  7. Lead
  8. ViewContent

### 3. Campaign Optimization
- When creating ad campaigns, optimize for **QualifiedLead** or **BookedCall** instead of **Lead**
- This tells Meta's algorithm to find people who are likely to qualify and book, not just submit forms

### 4. Custom Conversions (Optional)
- Create custom conversions in Events Manager for the custom events (QualifiedLead, BookedCall, ShowedCall, Opportunity)
- This allows you to use them as optimization events in campaigns

---

## Lead Scoring Configuration

Edit `lib/lead-scoring.ts` to adjust scoring criteria:

```typescript
// Revenue thresholds that disqualify
const DISQUALIFYING_REVENUE = ['under-500k'];

// Revenue thresholds that qualify
const QUALIFYING_REVENUE = ['500k-1m', '1m-5m', '5m+'];

// Roles that disqualify
const DISQUALIFYING_ROLES = ['not-decision-maker'];

// Roles that qualify
const QUALIFYING_ROLES = ['sole-owner', 'partner-authority'];

// Disposable email domains
const DISPOSABLE_DOMAINS = ['mailinator.com', 'guerrillamail.com', ...];
```

---

## Common Issues

### Events not showing in Events Manager
- Check that `META_CAPI_ACCESS_TOKEN` is set and valid
- Check that `NEXT_PUBLIC_META_PIXEL_ID` matches your Pixel ID
- Use `META_TEST_EVENT_CODE` to see events in the Test Events tab

### Deduplication not working
- Verify that the same `event_id` is being sent from both browser and server
- Check browser DevTools Network tab for the Pixel request — look for `eid` parameter
- Check server logs for the CAPI request payload

### Lifecycle events returning 404
- The lead must already exist in the `leads` table (they must have submitted a form first)
- Check that the email matches exactly (case-insensitive)

### Lifecycle events returning 401
- Check that `CRM_WEBHOOK_SECRET` is set in both your env and the GHL webhook config
- The header must be `x-webhook-secret` (lowercase)
