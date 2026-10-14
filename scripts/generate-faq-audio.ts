// ---------------------------------------------------------------------------
// Render Daniela's eight FAQ answers to mp3 with ElevenLabs.
//
//   npx tsx scripts/generate-faq-audio.ts --dry      see the scripts and the cost
//   npx tsx scripts/generate-faq-audio.ts            generate the missing ones
//   npx tsx scripts/generate-faq-audio.ts --force    re-render everything
//   npx tsx scripts/generate-faq-audio.ts --only b-pricing,b-security
//   npx tsx scripts/generate-faq-audio.ts --force --speed 1.12   brisker
//
// The text comes from lib/booking-faq.ts — the same strings the page puts on
// screen. That is the whole point: she reads what the prospect is reading.
// Edit an answer there and re-run; nothing is typed twice.
//
// NOT the same job as app/api/faq-voice/route.ts. That route asks a model to
// improvise an answer and then voices it, live, per visitor. This writes
// fixed files from fixed copy, once, and the page just plays them.
//
// ⚠️  This spends ElevenLabs credits, billed per character. Run --dry first;
// it prints the exact character count per file and the total, and makes no
// network calls. Existing files are skipped unless --force, so a re-run
// after adding one answer costs one answer.
// ---------------------------------------------------------------------------

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { BOOKING_B_FAQ } from '../lib/booking-faq';

/** Daniela. The same voice app/api/faq-voice/route.ts uses — do not change
 *  it without re-rendering every file, or page B will have two Danielas. */
const VOICE_ID = '6rOxfAnZpbM3VIEhFaeV';

const MODEL_ID = 'eleven_multilingual_v2';

/**
 * Delivery pace, measured rather than guessed.
 *
 * At 1.0 the 34-word answer ran 14.1s — 145 wpm, just under conversational
 * English, which sits at 150-170. The usable range is narrower than the
 * 0.7-1.2 the API accepts: 0.8 gives 16.6s and 1.2 gives 12.8s on that same
 * line, so the whole span is about 23% and 1.08 moved it by 4%, which is
 * inaudible.
 *
 * 1.15 lands around 155 wpm — brisk enough to sound like someone answering
 * a question, short of the clipped consonants that make it read as
 * synthetic. Change it per run with --speed.
 */
const DEFAULT_SPEED = 1.15;

/**
 * Filenames, in the page's order. These match the commented-out `audio`
 * slots in lib/booking-faq.ts — generate a file, uncomment its line.
 */
const SLUGS = [
  'b-how-it-works',
  'b-who-runs-ads',
  'b-timeline',
  'b-what-you-own',
  'b-security',
  'b-communication',
  'b-who-runs-account',
  'b-pricing',
];

const OUT_DIR = path.join(process.cwd(), 'public', 'audio', 'faq');

/**
 * What ElevenLabs is given.
 *
 * SINGLE newlines between paragraphs, not double. The answers are written
 * to be read, and a reader sees a paragraph break as white space — but
 * doubled up they became a dead stop of nearly a second each, which is what
 * made the first render sound like a voicemail rather than a person
 * answering a question. One newline still gives her a beat.
 */
function toScript(answer: string): string {
  return answer
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

async function synthesize(apiKey: string, text: string, speed: number): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          // Slightly below the old 0.5. A perfectly stable read comes out
          // flat, and flat gives an AI voice away faster than pace does.
          stability: 0.45,
          similarity_boost: 0.75,
          // Nudged up with it, for the same reason.
          style: 0.2,
          // Keeps her the same person across eight separate renders.
          use_speaker_boost: true,
          // Conversational pace. ElevenLabs accepts 0.7-1.2; past about
          // 1.15 consonants start clipping and it reads as synthetic,
          // which is the opposite of the point. Override with --speed.
          speed,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Reads the key out of .env.local rather than requiring it be exported. */
async function readApiKey(): Promise<string | null> {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try {
    const env = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
    const line = env.split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY='));
    const value = line?.slice('ELEVENLABS_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
    return value || null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const speedArg = args.find((a) => a.startsWith('--speed'));
  const speed = speedArg
    ? Number(speedArg.split('=')[1] ?? args[args.indexOf(speedArg) + 1])
    : DEFAULT_SPEED;
  if (!Number.isFinite(speed) || speed < 0.7 || speed > 1.2) {
    throw new Error(`--speed must be between 0.7 and 1.2 (got ${speed}).`);
  }

  const onlyArg = args.find((a) => a.startsWith('--only'));
  const only = onlyArg
    ? new Set((onlyArg.split('=')[1] ?? args[args.indexOf(onlyArg) + 1] ?? '').split(','))
    : null;

  if (BOOKING_B_FAQ.length !== SLUGS.length) {
    throw new Error(
      `${BOOKING_B_FAQ.length} answers but ${SLUGS.length} filenames. Add the missing slug to SLUGS, in page order.`,
    );
  }

  const jobs = BOOKING_B_FAQ.map((item, i) => {
    const slug = SLUGS[i];
    const text = toScript(item.answer ?? '');
    return { slug, text, question: item.question, file: path.join(OUT_DIR, `${slug}.mp3`) };
  }).filter((j) => !only || only.has(j.slug));

  const missingText = jobs.filter((j) => !j.text);
  if (missingText.length) {
    throw new Error(`No answer text for: ${missingText.map((j) => j.slug).join(', ')}`);
  }

  const total = jobs.reduce((n, j) => n + j.text.length, 0);
  console.log(
    `\n${jobs.length} answers, ${total.toLocaleString('en-US')} characters total, speed ${speed}\n`,
  );
  for (const j of jobs) {
    const state = existsSync(j.file) ? (force ? 're-render' : 'skip, exists') : 'generate';
    console.log(
      `  ${j.slug.padEnd(20)} ${String(j.text.length).padStart(5)} chars   ${state}\n` +
        `  ${' '.repeat(20)} ${j.question}`,
    );
  }

  if (dry) {
    console.log('\n--dry: nothing sent, nothing written.\n');
    return;
  }

  const apiKey = await readApiKey();
  if (!apiKey) {
    throw new Error(
      'ELEVENLABS_API_KEY not found in the environment or .env.local. Add it and re-run.',
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  for (const j of jobs) {
    if (existsSync(j.file) && !force) continue;
    process.stdout.write(`\n  ${j.slug} … `);
    const mp3 = await synthesize(apiKey, j.text, speed);
    await writeFile(j.file, mp3);
    written += 1;
    const kb = Math.round(mp3.length / 1024);
    const sum = createHash('sha256').update(mp3).digest('hex').slice(0, 8);
    process.stdout.write(`${kb} KB  ${sum}`);
  }

  console.log(
    `\n\n${written} file${written === 1 ? '' : 's'} written to public/audio/faq/.\n` +
      `Uncomment the matching \`audio:\` lines in lib/booking-faq.ts to switch the players on.\n`,
  );
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
