# Gated product assets

Files here are **deliberately outside `public/`** — anything in `public/` is a
guessable public URL, and the PDF in this directory is the entire $297 product.

It is served by `app/api/advisory-pricing/download/route.ts`, which checks
`advisory_purchased_at` on the buyer's lead row before streaming the file.

## Required file

`book-of-business-accelerator.pdf` — the five-page Book of Business Accelerator.

Until it is here the funnel still works: `hasAdvisoryDelivery()` returns false
and the delivery block tells the buyer their copy is on its way by email
instead of rendering a button that 404s.

`next.config.ts` lists `./assets/**` under `outputFileTracingIncludes` for the
download route. Without that entry the file is missing from the serverless
bundle and the route 404s **in production only**.
