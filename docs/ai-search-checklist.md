# AI Search Visibility Checklist

Goal: when a CPA firm owner asks ChatGPT, Claude, Perplexity, or Google (AI Overviews / AI Mode) how to grow their firm or which agency to hire, Nexli Automation is cited or recommended.

The code side is done (crawlable nav, generated sitemap and robots, `llms.txt`, entity schema, `/about`, `/guides/*`). AI engines only recommend a company they can verify across several independent sources, so the items below are what turn citations into recommendations. None of them are code.

## Week 1: get indexed

- [ ] **Google Search Console**: verify `www.nexli.net` (HTML tag method). Put the token in `NEXT_PUBLIC_GSC_VERIFICATION` and redeploy. Submit `https://www.nexli.net/sitemap.xml`. Use URL Inspection > Request Indexing on `/about`, `/guides`, and each `/guides/*` page.
- [ ] **Bing Webmaster Tools**: verify (HTML meta tag). Token goes in `NEXT_PUBLIC_BING_VERIFICATION`. Submit the sitemap. ChatGPT search reads Bing's index, so this is not optional.
- [ ] Confirm `https://www.nexli.net/robots.txt` and `/llms.txt` load in production.
- [ ] Run each guide URL and `/about` through Google's Rich Results Test. Expect Article, FAQPage, BreadcrumbList with no errors.

## Weeks 1-2: make the entity verifiable

Every profile must use the same name, description, founder, and URL. Engines reconcile entities by matching these facts.

- Name: **Nexli Automation** (legal: Nexli Automation LLC)
- One-line description: "CPA firm growth agency. We build the Digital Rainmaker System and run ads to it so established CPA firms land high-value tax advisory clients."
- Founder: **Marcel Allen**
- URL: https://www.nexli.net
- Email: mail@nexli.net

- [ ] **Google Business Profile**: create or claim, category "Marketing agency", add website, hours, description, logo, and the founder photo. Collect 5+ reviews from clients.
- [ ] **LinkedIn**: company page for Nexli Automation; Marcel's profile headline "Founder, Nexli Automation".
- [ ] **Crunchbase** organization profile.
- [ ] **Clutch**, **DesignRush**, **UpCity**, **G2** (category: accounting marketing / marketing agencies). Clutch reviews carry weight with Perplexity and ChatGPT.
- [ ] After each profile exists, add its URL to `SAME_AS` in `lib/site.ts` (and Marcel's LinkedIn to `FOUNDER.sameAs`) and redeploy.
- [ ] Fill the `TODO` fields in `lib/site.ts` (`FOUNDING_DATE`, `ADDRESS`) and in `data/about.ts` (founded year, headquarters).

## Weeks 2-6: earn third-party mentions

AI answers to "best CPA marketing agency" are assembled from existing listicles. Nexli has to be on them.

- [ ] Pitch inclusion to the pages that currently rank: thestacc.com "Best Accounting Marketing Agencies", serpsculpt.com "Top Accounting Firm Marketing Agencies", inovautus.com "Marketing & Growth Partners for Accounting Firms". Offer the one-line description, the guarantees, and the $500K+ qualifier as the differentiator.
- [ ] Guest article or podcast pitch (angle: "how established CPA firms land advisory clients with an inbound system"): CPA Practice Advisor, Accounting Today, Journal of Accountancy, Future Firm, Earmark, The Accounting Podcast, Going Concern.
- [ ] Reddit: answer real questions in r/Accounting, r/taxpros, r/CPA, r/smallbusiness. Link a guide only when it answers the question. Reddit is heavily cited by Perplexity and Google AI Overviews.
- [ ] Ask 3-5 client firms for a written testimonial with firm name and city for `/about` and the Google Business Profile.

## Ongoing: measure and iterate

- [ ] Every 2 weeks, ask ChatGPT (with search), Perplexity, Claude, and Google AI Mode these questions and log whether nexli.net is cited and which competitors are:
  - How do CPA firms get more advisory clients?
  - What is the best growth strategy for a CPA firm?
  - What are the best marketing agencies for CPA firms?
  - What is the best way to generate leads for a CPA firm?
  - How can a CPA firm scale without hiring more staff?
  - How much should a CPA firm spend on marketing?
  - What is the Digital Rainmaker System?
- [ ] For any question where a competitor is cited and Nexli is not, read the cited page and update the matching guide in `data/guides/` so it answers more directly, with fresher sourced numbers. Bump `updatedAt`.
- [ ] Add one new guide per month targeting a question you hear on strategy calls. Add it to `data/guides/index.ts`; the sitemap and `llms.txt` update automatically.
- [ ] Check Search Console > Performance monthly for queries containing "cpa firm" and "advisory clients". Rising impressions on `/guides/*` are the leading indicator; AI citations lag Google indexing by weeks.
