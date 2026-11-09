// ---------------------------------------------------------------------------
// Builds the See the Math PDFs from the live deck.
//
//   node scripts/build-math-pdf.mjs [desktop|phone] [base-url]
//
// With no format it builds both:
//   desktop  public/downloads/nexli-see-the-math.pdf        16:9 slides
//   phone    public/downloads/nexli-see-the-math-phone.pdf  the phone layout,
//            one page per slide, each page as tall as its slide
// base-url defaults to http://localhost:3000; the dev server or `next start`
// must be running there. Rebuild after any change to a slide or to
// lib/see-the-math, so the PDFs prospects download keep matching the deck.
// Which one a visitor gets is decided in components/math/pdf and
// app/math/pdf.
//
// Each comes from its print page (app/math/print): /math/print at exactly
// 1280×720, because each slide fits itself to the window; /math/print/phone
// at a 390px phone width, which measures its slides and gives every page its
// own height with CSS named pages. The width passed to page.pdf is what
// Chrome evaluates the layout's breakpoints against, so it must match: left
// to @page alone, Chrome used its default Letter width and printed the wrong
// layout. Reduced motion is emulated so nothing is caught mid-animation, and
// the site's Meta Pixel and analytics are blocked: a PDF build is not a visit.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const FORMATS = {
  desktop: {
    route: '/math/print',
    out: 'public/downloads/nexli-see-the-math.pdf',
    viewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
    pdf: { width: '1280px', height: '720px', printBackground: true },
  },
  phone: {
    route: '/math/print/phone',
    out: 'public/downloads/nexli-see-the-math-phone.pdf',
    viewport: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    // preferCSSPageSize: each page keeps the size its named @page gives it.
    pdf: { width: '390px', height: '844px', preferCSSPageSize: true, printBackground: true },
    waitForPages: true,
  },
};

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? 'http://localhost:3000').replace(/\/$/, '');
const picked = args.filter((a) => a in FORMATS);
const formats = picked.length ? picked : Object.keys(FORMATS);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOCK = [/facebook\.(com|net)/, /portal\.nexli\.net/, /vercel-insights|vitals\.vercel/];

/** Page sizes, read straight from the PDF's page dictionaries. page.pdf
 *  returns a Uint8Array, so it goes through Buffer to be read as text. */
const mediaBoxes = (pdf) =>
  [...Buffer.from(pdf).toString('latin1').matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);

const browser = await puppeteer.launch({ headless: true });
try {
  for (const name of formats) {
    const f = FORMATS[name];
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on('request', (r) => (BLOCK.some((re) => re.test(r.url())) ? r.abort() : r.continue()));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport(f.viewport);

    const res = await page.goto(`${base}${f.route}`, { waitUntil: 'networkidle0', timeout: 120_000 });
    if (!res?.ok()) throw new Error(`${base}${f.route} answered ${res?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    if (f.waitForPages) await page.waitForFunction(() => document.documentElement.dataset.pagesReady, { timeout: 30_000 });
    // Charts measure their width after mount, then draw; give them a beat.
    await new Promise((r) => setTimeout(r, 2000));

    const pages = await page.$$eval('.print-page', (els) => els.length);
    const pdf = await page.pdf(f.pdf);
    await page.close();

    // Check what came out before writing it.
    const boxes = mediaBoxes(pdf);
    if (boxes.length !== pages) throw new Error(`${name}: ${pages} slides but ${boxes.length} PDF pages`);
    if (f.waitForPages && new Set(boxes.map((b) => Math.round(b[1]))).size < 2) {
      throw new Error(`${name}: every page is the same height; Chrome ignored the named page sizes`);
    }
    if (errors.length) throw new Error(`${name}: page errors:\n${errors.join('\n')}`);

    fs.writeFileSync(path.join(root, f.out), pdf);
    const heights = boxes.map((b) => Math.round(b[1] / 0.75));
    console.log(
      `Wrote ${f.out}: ${pages} pages, ${(pdf.length / 1024).toFixed(0)} KB` +
        (f.waitForPages && heights.length ? `, ${f.viewport.width}px wide, ${Math.min(...heights)}–${Math.max(...heights)}px tall` : ''),
    );
  }
} finally {
  await browser.close();
}
