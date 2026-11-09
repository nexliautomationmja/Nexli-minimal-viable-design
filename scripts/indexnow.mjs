#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Tell search engines that nexli.net pages changed, via IndexNow.
//
// WHY. ChatGPT's web search answers from Bing's index, and Bing re-crawls a
// small site slowly. IndexNow is Bing's (and Yandex's, Seznam's and Naver's)
// "these URLs changed, come and get them" endpoint. One ping after a deploy
// that changes what the site says gets the new wording into the index in
// days instead of weeks.
//
// USAGE (after the deploy is live — it submits the LIVE sitemap):
//   node scripts/indexnow.mjs                 every URL in the live sitemap
//   node scripts/indexnow.mjs /about /pricing just these paths
//
// The key is the file public/<KEY>.txt, which must be live at
// https://www.nexli.net/<KEY>.txt for the ping to be accepted. It is public
// by design; it only proves the pinger controls the site.
// ---------------------------------------------------------------------------

const SITE = 'https://www.nexli.net';
const HOST = 'www.nexli.net';
const KEY = 'cb1a79c70bc6bd9d7c440065269133f6';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`))
    : await sitemapUrls();

  if (!urlList.length) throw new Error('No URLs to submit.');

  // Check the key file is live first: IndexNow rejects the whole batch
  // (403) if it cannot fetch it, and the error it returns does not say why.
  const keyRes = await fetch(`${SITE}/${KEY}.txt`);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : '';
  if (keyBody !== KEY) {
    throw new Error(`${SITE}/${KEY}.txt is not live yet (status ${keyRes.status}). Deploy first, then run this.`);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  });

  // 200 = accepted, 202 = accepted and key validation pending.
  console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URL(s).`);
  if (res.status !== 200 && res.status !== 202) {
    console.log(await res.text());
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
