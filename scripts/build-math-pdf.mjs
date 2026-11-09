// ---------------------------------------------------------------------------
// Builds public/downloads/nexli-see-the-math.pdf from the live deck.
//
//   node scripts/build-math-pdf.mjs [base-url]
//
// base-url defaults to http://localhost:3000; the dev server or `next start`
// must be running there. It opens /math/print (app/math/print), which lays
// every slide in components/math/slides on its own 16:9 page, and prints it.
// Rebuild after any change to a slide or to lib/see-the-math, so the PDF
// prospects download keeps matching the deck they were shown.
//
// Opened at exactly 1280×720 because each slide fits itself to the window
// (see app/math/print/math-print). Reduced motion is emulated so nothing is
// caught mid-animation. The site's Meta Pixel and analytics are blocked: a
// PDF build is not a visit.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/downloads/nexli-see-the-math.pdf');
const BLOCK = [/facebook\.(com|net)/, /portal\.nexli\.net/, /vercel-insights|vitals\.vercel/];

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', (r) => (BLOCK.some((re) => re.test(r.url())) ? r.abort() : r.continue()));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  const res = await page.goto(`${base}/math/print`, { waitUntil: 'networkidle0', timeout: 120_000 });
  if (!res?.ok()) throw new Error(`${base}/math/print answered ${res?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  // Charts measure their width after mount, then draw; give them a beat.
  await new Promise((r) => setTimeout(r, 2500));

  const pages = await page.$$eval('.print-page', (els) => els.length);
  // The size is passed here, not left to @page: with preferCSSPageSize alone
  // Chrome evaluated the layout's breakpoints against its default Letter
  // width (816px) and printed the phone layout, one column, overflowing.
  const pdf = await page.pdf({ width: '1280px', height: '720px', printBackground: true });
  fs.writeFileSync(out, pdf);
  console.log(`Wrote ${path.relative(root, out)}: ${pages} slides, ${(pdf.length / 1024).toFixed(0)} KB`);
  if (errors.length) {
    console.error('Page errors:\n' + errors.join('\n'));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
