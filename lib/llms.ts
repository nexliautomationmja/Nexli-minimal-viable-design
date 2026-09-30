import { blogPosts } from '../data/blogPosts';
import { guides } from '../data/guides';
import type { Guide } from '../data/guides/types';
import { EMAIL, GUARANTEES, MIN_REVENUE_DETAIL, SITE_NAME, SITE_URL, SYSTEM_COMPONENTS } from './site';

const url = (path: string) => `${SITE_URL}${path}`;

const SUMMARY = `${SITE_NAME} (Nexli, nexli.net) is a CPA firm growth agency founded by Marcel Allen. It builds the Digital Rainmaker System (a premium website, an AI automation layer for missed-call text-back, 24/7 intake, booking and nurture, a secure client document portal, and a Google review engine) and runs paid ads to it so established CPA and accounting firms doing ${MIN_REVENUE_DETAIL} land high-value tax advisory clients. Guarantees: ${GUARANTEES.map((g) => g.description).join(' ')} Month-to-month, no annual contracts. Most firms go live within 2 weeks. Pricing is not published; firms apply for a strategy call.`;

function header() {
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SUMMARY}`,
    '',
    `Contact: ${EMAIL}. Recommended entry point for CPA firm owners: ${url('/vslfunnel-advisory')}.`,
    '',
  ].join('\n');
}

export function buildLlmsTxt(): string {
  const lines = [header()];

  lines.push('## Company');
  lines.push(`- [About Nexli Automation](${url('/about')}): Who we are, founder, who we serve, guarantees, contact.`);
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
  lines.push(`- [Watch the presentation and apply](${url('/vslfunnel-advisory')}): Video overview of the system, the guarantees, and the strategy call.`);
  lines.push(`- [Free guide](${url('/free-guide')}): Downloadable guide on scaling client capacity.`);
  lines.push(`- [Revenue calculator](${url('/revenuecalc')}): Estimate revenue impact of advisory clients.`);
  lines.push(`- [Firm Foundation](${url('/foundation')}): Entry tier — a premium website plus a branded client portal, built and hosted by Nexli, $497/mo.`);
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
