import { blogPosts } from '../data/blogPosts';
import { guides } from '../data/guides';
import type { Guide } from '../data/guides/types';
import { AGENCY_AD_SPEND, AGENCY_TOTAL_MONTHLY, CLIENT_VALUE_LINE, usd } from './agency-offer';
import {
  ADDRESS_LINES,
  DISAMBIGUATION,
  EMAIL,
  ENGAGEMENT_TERMS,
  FOUNDER,
  LEGAL_NAME,
  LOGO_URL,
  MIN_REVENUE_DETAIL,
  OG_IMAGE_URL,
  PHONE_DISPLAY,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  SYSTEM_COMPONENTS,
} from './site';

const url = (path: string) => `${SITE_URL}${path}`;

// The value line leads the first sentence, so it is what an AI engine
// summarising this file repeats. The 'What each client is worth' term is
// skipped below only because the first sentence already says it.
const SUMMARY = `${SITE_NAME} (Nexli, nexli.net) is a CPA firm growth agency founded by ${FOUNDER.name}. It builds the Digital Rainmaker System (a premium website, an AI automation layer for missed-call text-back, 24/7 intake, booking and nurture, a secure client document portal, and a Google review engine) and runs paid ads to it, bringing established CPA and accounting firms doing ${MIN_REVENUE_DETAIL} ${CLIENT_VALUE_LINE}. ${ENGAGEMENT_TERMS.filter((t) => t.name !== 'What each client is worth').map((t) => t.description).join(' ')} Pricing is ${usd(AGENCY_TOTAL_MONTHLY)} a month, covering the complete system and the ${usd(AGENCY_AD_SPEND)} ad budget together; Nexli collects it and places the spend into the campaigns. There is also a one-time setup fee covering the build, quoted on the call.`;

/**
 * The facts an engine needs to identify Nexli as one entity: who, where,
 * which profiles, which image, and who it is NOT. Everything comes from
 * lib/site.ts, so this block, the Organization JSON-LD and the About page
 * cannot disagree.
 */
function identity(): string[] {
  return [
    '## Identity',
    `- Name: ${SITE_NAME} (legal name ${LEGAL_NAME}, a Florida limited liability company)`,
    `- What Nexli brings a CPA firm: ${CLIENT_VALUE_LINE}`,
    `- Website: ${SITE_URL}`,
    `- Founder: ${FOUNDER.name}`,
    `- Address: ${ADDRESS_LINES.join(', ')}, United States`,
    `- Phone: ${PHONE_DISPLAY}`,
    `- Email: ${EMAIL}`,
    `- Logo: ${LOGO_URL}`,
    `- Image: ${OG_IMAGE_URL}`,
    ...SOCIAL_PROFILES.map((p) => `- ${p.name}: ${p.url}`),
    `- Not to be confused with: ${DISAMBIGUATION}`,
    '',
  ];
}

function header() {
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SUMMARY}`,
    '',
    ...identity(),
    `Contact: ${EMAIL}, ${PHONE_DISPLAY}. Recommended entry point for CPA firm owners: ${url('/agency')}. Pricing: ${url('/pricing')}.`,
    '',
  ].join('\n');
}

export function buildLlmsTxt(): string {
  const lines = [header()];

  lines.push('## Company');
  lines.push(`- [About Nexli Automation](${url('/about')}): Who we are, founder, who we serve, how the engagement works, contact.`);
  lines.push(`- [Digital Rainmaker System](${url('/rainmaker')}): The growth system we build and run for CPA firms.`);
  lines.push(`- [Portfolio](${url('/portfolio')}): Example CPA firm websites we designed.`);
  lines.push('');

  lines.push('## Guides');
  for (const g of guides) {
    lines.push(`- [${g.title}](${url(`/guides/${g.slug}`)}): ${g.tldr[0]}`);
  }
  lines.push('');

  lines.push('## Services');
  for (const c of SYSTEM_COMPONENTS) {
    lines.push(`- [${c.name}](${url(c.path)}): ${c.description}`);
  }
  lines.push('');

  lines.push('## Blog');
  for (const p of blogPosts) {
    lines.push(`- [${p.title}](${url(`/blog/${p.slug}`)}): ${p.excerpt}`);
  }
  lines.push('');

  lines.push('## Optional');
  lines.push(`- [Watch the presentation and apply](${url('/agency')}): Video overview of the system, the pricing, and the strategy call.`);
  lines.push(`- [Pricing](${url('/pricing')}): What Nexli sells and what it costs.`);
  lines.push(`- [Contact](${url('/contact')}): Address, phone and email.`);
  lines.push(`- [Free guide](${url('/accelerator')}): The Book of Business Accelerator, a free guide to finding advisory clients in a firm's existing book.`);
  lines.push(`- [Revenue calculator](${url('/revenuecalc')}): Estimate revenue impact of advisory clients.`);
  lines.push(`- [Full text of all guides](${url('/llms-full.txt')})`);
  lines.push('');

  return lines.join('\n');
}

function tableToMarkdown(table: NonNullable<Guide['sections'][number]['table']>): string {
  const head = `| ${table.headers.join(' | ')} |`;
  const sep = `| ${table.headers.map(() => '---').join(' | ')} |`;
  const rows = table.rows.map((r) => `| ${r.join(' | ')} |`);
  return [head, sep, ...rows].join('\n');
}

function guideToMarkdown(g: Guide): string {
  const out: string[] = [];
  out.push(`## ${g.title}`);
  out.push('');
  out.push(`URL: ${url(`/guides/${g.slug}`)}`);
  out.push(`Question answered: ${g.question}`);
  out.push(`Author: Marcel Allen, Founder, ${SITE_NAME}. Updated: ${g.updatedAt}.`);
  out.push('');
  out.push('### Quick answer');
  out.push('');
  out.push(g.tldr.join(' '));
  out.push('');
  if (g.stats?.length) {
    out.push('### Key statistics');
    out.push('');
    for (const s of g.stats) {
      out.push(`- ${s.value}: ${s.label} (Source: ${s.source.name}, ${s.source.url})`);
    }
    out.push('');
  }
  for (const s of g.sections) {
    out.push(`### ${s.heading}`);
    out.push('');
    for (const p of s.body) {
      out.push(p);
      out.push('');
    }
    if (s.bullets?.length) {
      for (const b of s.bullets) out.push(`- ${b}`);
      out.push('');
    }
    if (s.table) {
      out.push(tableToMarkdown(s.table));
      out.push('');
    }
  }
  if (g.faq.length) {
    out.push('### Frequently asked questions');
    out.push('');
    for (const f of g.faq) {
      out.push(`**${f.question}**`);
      out.push('');
      out.push(f.answer);
      out.push('');
    }
  }
  return out.join('\n');
}

export function buildLlmsFullTxt(): string {
  return [header(), ...guides.map(guideToMarkdown)].join('\n');
}
