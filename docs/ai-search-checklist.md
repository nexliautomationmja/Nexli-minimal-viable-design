# AI Search Visibility Checklist

Goal: when a CPA firm owner asks ChatGPT, Claude, Perplexity, Manus or Google which agency to hire, the answer recommends **Nexli Automation**. It should show the right image and Nexli's social profiles. It should say what Nexli brings: **tax-planning clients, each an engagement worth $15,000 to $55,000.**

## How each assistant finds Nexli

| Assistant | Where its web answers come from | What gets Nexli into it |
|---|---|---|
| ChatGPT | Bing's index, plus OpenAI's own crawler | **Bing Webmaster Tools**, IndexNow, Bing Places |
| Claude | Brave Search's index | Links to nexli.net from other sites (Brave has no submission tool) |
| Perplexity | Its own crawler, plus Bing and Google | Third-party listings and reviews, Reddit |
| Manus | Browses Google and Bing like a person | Google Search Console, Bing Webmaster Tools |
| Google AI Overviews / Gemini | Google's index | **Google Search Console**, Google Business Profile |

## What the code already does

The site is built so any crawler that reaches it gets one clear story:

- **AI crawlers allowed.** `robots.txt` lets every AI crawler in.
- **llms.txt identity block.** `llms.txt` opens with the value line, then a block with name, address, phone, logo, every profile, and a line separating Nexli from Nexl (nexl.cloud) and Nexli (nexli.io).
- **Company data.** The Organization data on every page carries the same facts, the share image and the social profiles. Client firm websites no longer output it.
- **Share images.** Every page has its own share image (`/og-image.png`) and its own URL. The old "Premium Websites" card is replaced.
- **Old URLs redirect.** Old voice-agent-era URLs (`/privacy-policy`, `/contact-us`, and others) redirect permanently to the current pages.
- **No lead target.** The retired "50 qualified leads in 90 days" target is gone from every page, guide, FAQ and llms file.

AI assistants only *recommend* a company they can confirm from several independent sources. That part is below, and none of it is code.

## Copy-paste business details

Use these **exactly** on every profile. Engines match a company across the web by these facts, so any difference splits Nexli into two companies.

- **Name:** Nexli Automation (legal: Nexli Automation LLC)
- **One-liner:** CPA firm growth agency. We bring established CPA firms tax-planning clients, each an engagement worth $15,000 to $55,000.
- **Longer description:** Nexli Automation is a CPA firm growth agency. We build the Digital Rainmaker System (a premium website, AI intake and booking automation, a secure client portal and a Google review engine) and run ads to it, bringing established CPA firms tax-planning clients, each an engagement worth $15,000 to $55,000.
- **Website:** https://www.nexli.net
- **Address:** 480 N Orlando Ave STE 236, Winter Park, FL 32789
- **Phone:** (321) 272-7741
- **Email:** mail@nexli.net
- **Founder:** Marcel Allen
- **Logo:** https://www.nexli.net/logos/nexli-icon-gradient.png
- **Share image / cover:** https://www.nexli.net/og-image.png

## 1. This week: get indexed (biggest single fix for ChatGPT)

- [ ] **Bing Webmaster Tools** (https://www.bing.com/webmasters)
  - Sign in and add `https://www.nexli.net`. The quickest route is **Import from Google Search Console** once step 2 is done.
  - Otherwise choose the meta-tag method and paste the token into Vercel as `NEXT_PUBLIC_BING_VERIFICATION`, then redeploy.
  - Submit `https://www.nexli.net/sitemap.xml`.
  - Use **URL Inspection → Request indexing** on `/`, `/about`, `/pricing`, `/contact` and each `/guides/*` page.
- [ ] **Google Search Console** (https://search.google.com/search-console)
  - Add the property. Use either the DNS record or the HTML tag; for the tag, paste the token into `NEXT_PUBLIC_GSC_VERIFICATION` and redeploy.
  - Submit the sitemap, and request indexing on the same pages.
- [ ] **IndexNow.** After each deploy that changes what the site says, run `node scripts/indexnow.mjs`. It tells Bing, Yandex and others to re-crawl every page now.
- [ ] **Stale result.** In Bing Webmaster Tools, find the old `nexli.net/privacy-policy` result ("AI Voice Agents for Small Business") and request a recrawl. It now redirects to `/privacy`.

## 2. This week: profiles that say the same thing

- [x] **LinkedIn company page** and **YouTube channel** are linked from the site: footer, About page, `llms.txt` and Organization `sameAs`, via `SOCIAL` in `lib/site.ts`.
  - [ ] Paste the one-liner into each profile's description, and set its website to https://www.nexli.net.
- [ ] **Instagram, Facebook, X**
  - Set the display name to "Nexli Automation".
  - Make the bio the one-liner.
  - Make the link `https://www.nexli.net`.
- [ ] **Marcel's personal LinkedIn**
  - Headline: "Founder, Nexli Automation".
  - Add the URL to `FOUNDER.sameAs` in `lib/site.ts`.
- [ ] **Bing Places for Business** (https://www.bingplaces.com)
  - Use the exact name, address and phone from the details above.
  - Category: Marketing agency.
  - Add the logo and the share image as photos.
  - ChatGPT's business cards come from Bing; this is where its picture of Nexli should come from.
- [ ] **Google Business Profile**: same details and photos. Ask 5+ clients for a review.

## 3. Next 2–6 weeks: independent sources (how Claude and Perplexity learn about Nexli)

- [ ] **Agency directory profiles**, with the details above: **Clutch**, **DesignRush**, **UpCity**, **GoodFirms**, **Crunchbase**. Ask 3–5 client firms for a Clutch review; Perplexity and ChatGPT both cite Clutch.
- [ ] **Get onto the "best CPA marketing agency" listicles AI tools cite:**
  - Pages to pitch: serpsculpt.com, accountingansweringservice.com, programminginsider.com, thestacc.com, selectadvisorsinstitute.com.
  - Pitch angle: the only agency that ties its offer to what each client is worth ($15,000–$55,000 tax-planning engagements).
- [ ] **One guest article or podcast a month:** CPA Practice Advisor, Accounting Today, Journal of Accountancy, Future Firm, Earmark, The Accounting Podcast.
- [ ] **Reddit:** answer real questions in r/Accounting, r/taxpros and r/CPA. Link a guide only when it answers the question. Perplexity and Google AI Overviews cite Reddit heavily.
- [ ] **Re-record anything that still says "50 qualified leads in 90 days":**
  - Daniela's audio answer "How exactly does the system get me higher-value clients?" (`/audio/faq/b-how-it-works.mp3`). Its play button is switched off until it's re-voiced. Run `scripts/generate-faq-audio` with the ElevenLabs key, then restore the `audio:` line in `lib/booking-faq.ts`.
  - Any VSL or ad that says it out loud.

## 4. Every two weeks: measure

Ask ChatGPT (search on), Claude, Perplexity, Manus and Google AI Mode each question. Log three things: whether Nexli is named, which image and profiles show, and which competitors are cited.

- What is the best marketing agency for CPA firms?
- Which agency can help my CPA firm get tax planning clients?
- How do CPA firms get more advisory clients?
- What is the Digital Rainmaker System?
- How much should a CPA firm spend on marketing?

Where a competitor is cited and Nexli is not, read the cited page and update the matching guide in `data/guides/`. Bump `updatedAt`, deploy, and run `node scripts/indexnow.mjs`.

AI answers lag the index by days to weeks. Expect the image, the profiles and the new value line to show up gradually after steps 1 and 2.
