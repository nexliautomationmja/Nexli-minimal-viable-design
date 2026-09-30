# Firm Foundation sites

Config-driven client websites for the $497/mo Firm Foundation tier. One
`FirmSiteConfig` object produces a complete, branded site (nav, hero, trust bar,
services, client-portal section, about, testimonials, CTA, footer) rendered by
`components/firm-site/FirmSitePage.tsx`.

## Database-driven sites (primary)

Firm sites are generated, edited and published in the **dashboard admin** and
stored as one row per firm in the `firm_sites` table (owned by the dashboard;
`lib/firm-sites-schema.ts` is the marketing app's read-only mirror). Nothing
here needs a deploy: every route below is `force-dynamic` and reads the table
at request time via `lib/firm-sites/resolve.ts`.

| URL | What it serves |
| --- | --- |
| `/sites/<slug>` | The published site by slug. Always `noindex`; the canonical points at the firm's domain. |
| `/sites/<slug>?preview=<token>` | Any status (draft included) when `token` equals the row's `preview_token`. Shows the amber "Draft preview" strip. Share this with the firm before publishing. |
| `https://<firm-domain>/` | `middleware.ts` rewrites any host that is not ours (`lib/firm-sites/hosts.ts`) to `/sites/host/<host>`, which looks the domain up in `firm_sites` (published rows only, `www.` stripped). Indexable; the browser URL stays on the firm's domain. |

Resolution order in `resolveFirmSite()`: a matching DB row wins (and a row that
exists but is not visible, e.g. a draft without the token, never falls through);
otherwise the static registry below is used. Row `config` is run through
`validateFirmSiteConfig()` on every request, so a broken JSON blob 404s and logs
rather than crashing the render. The row's `slug` and `domain` columns override
whatever the JSON says.

Custom domains still have to be attached to the Vercel project (Settings >
Domains, then the DNS records Vercel shows) so the request reaches the app;
after that, setting the domain in the dashboard is enough. If one of our own
hosts is ever mistaken for a firm domain, list it in `NEXT_PUBLIC_OWN_HOSTS`.

## Static configs (fallback and reference example)

`data/firm-sites/<slug>.ts` files registered in `lib/firm-sites/registry.ts`
remain as the fallback when the DB has no row (or no `DATABASE_URL`, as in local
dev) and as the reference example for what a complete `FirmSiteConfig` looks
like. The rest of this document describes that static path; the template
components, config notes and CSS variable scheme apply to both.

- Preview URL: `https://www.nexli.net/sites/<slug>` (always `noindex`).
- Live URL: the firm's own domain, rewritten by `middleware.ts` to `/sites/<slug>`.
  Only the custom domain is indexable and it is the canonical URL.

Reference config: `data/firm-sites/example-firm.ts` (Ridgeline Tax & Advisory).

## Files

| Path | Purpose |
| --- | --- |
| `lib/firm-sites/types.ts` | `FirmSiteConfig` type, section anchors, `toFirmBrandConfig()` adapter for the portfolio navbar contract |
| `lib/firm-sites/registry.ts` | `FIRM_SITES`, `DOMAIN_TO_SLUG`, `getFirmSite`, `getSlugForHost`, `getAllSlugs`. Edge-safe; imported by middleware |
| `lib/firm-sites/color.ts` / `fonts.ts` | Colour math (contrast, alpha, darken) and Google Fonts URL derivation |
| `data/firm-sites/<slug>.ts` | One config per firm |
| `components/firm-site/*` | Template sections, all styled from `--fs-*` CSS variables |
| `app/sites/[slug]/page.tsx` | Route, metadata (canonical + robots), `notFound()` for unknown slugs |
| `middleware.ts` | Host to slug rewrite |

## Add a firm

1. Copy `data/firm-sites/example-firm.ts` to `data/firm-sites/<slug>.ts`.
   Rename the export (e.g. `export const acmeCpa`), set `slug` to match the file
   name, and fill every field. Leave `domain` out until the firm's DNS is ready.
2. Register it in `lib/firm-sites/registry.ts`: import the config and add it to
   `CONFIGS`.
3. Run `npx tsc --noEmit` and open `http://localhost:3000/sites/<slug>`.
4. When going live, add `domain: 'theirfirm.com'` (apex only, no `www`, no
   protocol). Both `theirfirm.com` and `www.theirfirm.com` are routed.
5. Attach the domain in Vercel: Project > Settings > Domains > add the apex and
   `www` hostnames. Give the firm the DNS records Vercel shows (typically
   `A 76.76.21.21` for the apex and `CNAME cname.vercel-dns.com` for `www`).
   Vercel provisions TLS once DNS resolves.
6. Deploy. Confirm `https://theirfirm.com` renders the site, the `<link rel="canonical">`
   points at the firm domain, and `robots` is `index, follow` there but
   `noindex` on `nexli.net/sites/<slug>`.

### Config notes

- `colors`: `primary` drives the hero, portal section, footer and primary
  buttons; `accent` drives icons, eyebrows and the main CTA. Check the accent
  reads on both `primary` and `surface`. Text-on-primary and text-on-accent are
  computed automatically (white or near-black).
- `fonts`: full CSS stacks. The first named family in each stack is loaded
  from Google Fonts unless it is a system font (Georgia, system-ui, Arial ...).
- `style`: `'solid'` (nav in primary colour), `'glass'` (translucent primary
  with blur), `'minimal'` (nav on page background, dark text).
- `services[].icon`: one of the keys in `components/firm-site/icons.tsx`
  (`user`, `building`, `target`, `book`, `banknote`, `trending-up`, `shield`,
  `calculator`, `file-text`, `briefcase`, `landmark`, `receipt`, `wallet`,
  `clipboard`, `piggy-bank`, `scale`, `handshake`, `chart`, `globe`).
- `about.body`: separate paragraphs with a blank line (`\n\n`).
- `team`, `testimonials`, `stats`, `social`, `logo` are optional; sections
  hide themselves when empty.
- `portalUrl`: the firm's branded portal login (Nexli portal by default).
- `bookingUrl`: Cal.com or similar. Every CTA on the page points here.

## CSS variable scheme

`FirmSiteShell` sets these on the `.firm-site` wrapper from `cfg.colors` and
`cfg.fonts`; every section reads them, so the same components render any brand.

```
--fs-primary   --fs-primary-rgb   --fs-primary-dark   --fs-primary-deep   --fs-on-primary
--fs-accent    --fs-accent-rgb    --fs-on-accent
--fs-bg        --fs-surface       --fs-text           --fs-text-rgb       --fs-text-muted   --fs-border
--fs-font-heading   --fs-font-body
```

`*-rgb` variables hold `r, g, b` channels for `rgba(var(--fs-accent-rgb), 0.14)`
style tints. Utility classes defined in the shell: `.fs-container` (72rem,
16/24/32px gutters), `.fs-eyebrow`, `.fs-btn` + `.fs-btn-accent|primary|outline|outline-light`,
`.fs-card`.

## Fulfilment checklist (6 to 10 team hours per firm)

1. Kickoff call, 45 min: collect logo, brand colours, service list, bios,
   headshots, testimonials (with permission), contact details, hours, booking
   link, Google Business Profile and LinkedIn URLs, current domain and registrar
   login or DNS contact.
2. Copywriting, 2 h: tagline, hero headline and sub, six service blurbs, about
   section with four highlights, two to three stats the firm can defend, SEO
   title and description (firm name + city + "CPA firm").
3. Config build, 1 h: create `data/firm-sites/<slug>.ts`, register it, run
   `tsc`, preview at `/sites/<slug>`.
4. Brand pass, 1 h: tune `colors` for contrast (accent on primary, muted text on
   surface), pick heading and body fonts, choose `style`, drop the logo into
   `public/firm-sites/<slug>/` and reference it.
5. Assets, 30 min: compress headshots and OG image (1200x630) into
   `public/firm-sites/<slug>/`; set `seo.ogImage`, `team[].photo`.
6. Portal setup, 1 h: create the firm's branded portal, confirm the login URL
   and set `portalUrl`; test upload, e-sign, invoice and message flows once.
7. Booking, 15 min: confirm the Cal.com event, buffer and reminders; set
   `bookingUrl`.
8. QA, 1 h: mobile (375 px) and desktop, every link and anchor, `tel:` and
   `mailto:`, Lighthouse accessibility 95+, metadata (`title`, `description`,
   `canonical`, `robots`), no horizontal scroll, reduced-motion.
9. Go live, 30 min: add `domain`, attach in Vercel, send DNS records, verify
   TLS and canonical/robots on the live domain, submit the domain in Google
   Search Console.
10. Handoff, 30 min: send the firm their preview and live URLs, portal login
    instructions for clients, and how to request copy changes (config edit +
    deploy, usually under 15 minutes).
