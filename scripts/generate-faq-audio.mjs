// One-time script to generate pre-recorded Daniela FAQ voice messages via ElevenLabs
// Usage: ELEVENLABS_API_KEY=... node scripts/generate-faq-audio.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'faq');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY env var.');
  process.exit(1);
}
const VOICE_ID = '6rOxfAnZpbM3VIEhFaeV'; // Daniela's voice

const faqScripts = [
  {
    filename: 'faq-how-it-works.mp3',
    text: `Great question — here's the whole thing in thirty seconds. First, we build your infrastructure: the website, the client portal, the automations. That's what makes everything else work. Then we run targeted ads that put your firm in front of high-income taxpayers and business owners — people who've been overpaying the IRS for years and nobody's ever shown them real planning. Every lead gets qualified before they ever reach you — income level, fit, real opportunity. And then we book them directly on your calendar. You show up to the consult; everything before that is handled. That's the Digital Rainmaker System — one machine, start to finish.`,
  },
  {
    filename: 'faq-who-runs-ads.mp3',
    text: `We do — the creative, the targeting, the optimization, all of it. You're not learning Meta ads or hiring a media buyer. But here's the part most firms miss: ads alone don't work. If you send traffic to a website that looks like a digital business card, you're just setting your budget on fire. That's why we build the infrastructure first — so when the ads go live, there's an actual system behind them converting that attention into booked consultations. We'll walk through ad spend and how the campaigns work on your strategy call.`,
  },
  {
    filename: 'faq-client-quality.mp3',
    text: `This is honestly my favorite question, because it's the whole point. We're not sending you leads — we're booking qualified consultations. Before anyone touches your calendar, they've been screened: income level, business situation, whether there's a real planning or advisory opportunity. So you're not spending an hour with someone shopping around a $400 return. You're talking to six-and-seven-figure earners who already understand they need help and can comfortably pay for it. If they don't clear the bar, they never reach you. Your time only goes to conversations that can actually turn into premium engagements.`,
  },
  {
    filename: 'faq-deliver-advisory.mp3',
    text: `Look, if you're running an established firm, you already have the expertise — you've been staring at these returns for years and seeing the opportunities nobody's acting on. What you haven't had is a pipeline of clients who actually value that thinking and will pay for it. That's the missing piece, and that's the piece we deliver. And the math is what makes it exciting: one eight-thousand-dollar advisory client out-earns ten of those grind-it-out returns. You keep doing the work you're already great at — the system just makes sure the right clients are sitting across from you.`,
  },
  {
    filename: 'faq-burned-before.mp3',
    text: `I get it — and honestly, if you've been burned, you were probably right to be skeptical. Most agencies build you a pretty website, hand you the keys, and disappear. Lead vendors sell you the same tired list they sold five other firms. This is different in one fundamental way: it's a single system, and it's accountable for one thing — qualified consultations on your calendar. Not clicks, not impressions, not a report nobody reads. The website, the ads, the qualification, the booking — it's all one machine, you own it, and it either puts real prospects in front of you or it isn't doing its job.`,
  },
  {
    filename: 'faq-security.mp3',
    text: `Look, I totally get the concern — you're handling sensitive financial data, social security numbers, the works. Here's what most people don't realize: our document portal runs on Supabase, which is backed by AWS — the same infrastructure the IRS uses, the same systems hospitals and government agencies trust with their most sensitive data. We're talking SOC 2 Type II compliance, end-to-end encryption, the whole nine. Honestly? If it's good enough for the IRS, it's good enough for your firm. And I'd ask you this — what are you using right now? Because if it's Dropbox or shared drives or emailing documents back and forth, you're actually taking way more risk than you realize. You're not just getting a portal — you're getting a real security upgrade.`,
  },
];

async function generateAudio(text, filename) {
  console.log(`Generating: ${filename}...`);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.75,
        style: 0.6,
        speed: 1.1,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to generate ${filename}:`, err);
    return false;
  }

  const audioBuffer = await res.arrayBuffer();
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
  console.log(`Saved: ${outputPath}`);
  return true;
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\nGenerating ${faqScripts.length} FAQ audio files with Daniela's voice...\n`);

  let success = 0;
  for (const script of faqScripts) {
    const ok = await generateAudio(script.text, script.filename);
    if (ok) success++;
    // Small delay between requests to be nice to the API
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone! Generated ${success}/${faqScripts.length} audio files.`);
  console.log(`Files saved to: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
