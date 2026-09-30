'use client';
import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSignature,
  FileText,
  FolderOpen,
  Info,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Receipt,
  Search,
  Send,
  Settings,
  Upload,
  Users,
} from 'lucide-react';

/**
 * Static lookalike of the Nexli client portal, re-skinned with the firm's
 * name, logo and accent. No data, no navigation — every tab is a hand-built
 * screen so a prospect can see what their firm's portal will look like.
 *
 * Tokens mirror the real portal (nexli-portal): flat 1px-bordered cards,
 * Outfit body, 240px sidebar with icon-chip nav, gradient primary buttons.
 */
export interface PortalDemoProps {
  firmName: string;
  logoUrl?: string | null;
  /** Firm accent (buttons, active nav, gradient start). Defaults to portal blue. */
  accent?: string | null;
  /** Second gradient stop. Defaults to portal cyan. */
  accent2?: string | null;
  theme: 'dark' | 'light';
  /** Client shown in the "What your clients see" tab. */
  clientName?: string;
  /** Firm owner, for "Welcome back, {first name}" on the firm dashboard. */
  ownerName?: string;
  className?: string;
}

type TabId = 'dashboard' | 'engagements' | 'invoices' | 'organizer' | 'client';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Your dashboard' },
  { id: 'engagements', label: 'Engagement letters' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'organizer', label: 'Tax organizer' },
  { id: 'client', label: 'What your clients see' },
];

/**
 * Canvas tokens, derived from the firm site's own two palettes
 * (data/firm-sites/evergreen.ts colors / darkColors) so the website and the
 * portal read as one product rather than a green site next to a grey app.
 *
 * Dark stays effectively black, as asked, but green-black rather than neutral:
 * these are the site's dark bg lifted in small steps for nav / card / input,
 * keeping the same hue so nothing looks tinted by accident.
 * Light is the site's warm off-white canvas with pure-white cards on top, which
 * is what gives the cards their edge without relying on a heavy border.
 */
const TOKENS = {
  dark: {
    bg: '#0a1310',
    card: '#0f1c16',
    border: 'rgba(244,243,239,0.12)',
    text: '#f4f3ef',
    muted: 'rgba(244,243,239,0.66)',
    nav: '#0c1712',
    input: '#111f19',
    hover: 'rgba(244,243,239,0.05)',
  },
  light: {
    bg: '#fbfaf7',
    card: '#ffffff',
    border: '#e4e1d9',
    text: '#14201a',
    muted: '#5b655f',
    nav: '#ffffff',
    input: '#f4f2ec',
    hover: 'rgba(20,32,26,0.035)',
  },
} as const;

const ACCENTS = {
  blue: '#2563EB',
  cyan: '#06B6D4',
  teal: '#14B8A6',
  violet: '#8B5CF6',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
} as const;
type AccentName = keyof typeof ACCENTS;

const BADGES = {
  emerald: { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  blue: { bg: 'rgba(37,99,235,0.15)', fg: '#60a5fa' },
  amber: { bg: 'rgba(245,158,11,0.15)', fg: '#fbbf24' },
  rose: { bg: 'rgba(244,63,94,0.15)', fg: '#fb7185' },
  muted: { bg: 'rgba(161,161,170,0.15)', fg: '#a1a1aa' },
} as const;
type BadgeTone = keyof typeof BADGES;

function hexToRgb(hex: string): string | null {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) {
    const rgb = hex.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    return rgb ? `${rgb[1]}, ${rgb[2]}, ${rgb[3]}` : null;
  }
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
}

/**
 * Mix a colour toward white. Used for the shimmer pill's third stop: a pale
 * champagne struck off the gold accent, so the sweep has a highlight to travel
 * through instead of cutting straight back to green.
 */
function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.split(',').map((n) => Number(n.trim()));
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function initials(name: string): string {
  return name
    .replace(/[,(].*$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'A';
}

function firstNameOf(name: string | undefined, fallback: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first || fallback;
}

/* ------------------------------------------------------------------------ */
/* Primitives                                                                */
/* ------------------------------------------------------------------------ */

function Chip({ tone, children, size = 36 }: { tone: AccentName; children: React.ReactNode; size?: number }) {
  const c = ACCENTS[tone];
  const rgb = hexToRgb(c);
  return (
    <span
      className="pd-chip"
      style={{
        width: size,
        height: size,
        background: `rgba(${rgb}, 0.12)`,
        border: `1px solid rgba(${rgb}, 0.2)`,
        color: c,
      }}
    >
      {children}
    </span>
  );
}

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  const b = BADGES[tone];
  return (
    <span className="pd-badge" style={{ background: b.bg, color: b.fg }}>
      {children}
    </span>
  );
}

function ShimmerPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="pd-pill">
      <span className="pd-pill-spin" aria-hidden="true" />
      <span className="pd-pill-inner" aria-hidden="true" />
      <span className="pd-pill-text">{children}</span>
    </span>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="pd-btn-primary" role="presentation">
      {children}
    </span>
  );
}

/**
 * The only genuinely clickable button inside the device frame. Everything else
 * (`PrimaryButton`) is decorative chrome; the engagement flow is the one thing
 * a prospect is meant to drive end to end.
 */
function ActionButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={variant === 'primary' ? 'pd-btn-primary pd-btn' : 'pd-btn-ghost'}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: AccentName;
  hint?: string;
}) {
  return (
    <div className="pd-card pd-stat">
      <div className="pd-stat-top">
        <span className="pd-stat-label">{label}</span>
        <Chip tone={tone} size={32}>
          {icon}
        </Chip>
      </div>
      <div className="pd-stat-value">{value}</div>
      {hint && <div className="pd-stat-hint">{hint}</div>}
    </div>
  );
}

function SectionHeader({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="pd-section-head">
      <span className="pd-section-title">{children}</span>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Screens                                                                   */
/* ------------------------------------------------------------------------ */

const ACTIVITY = [
  { icon: <FileSignature size={15} />, tone: 'emerald' as AccentName, text: 'Redwood Realty Partners signed the Fractional CFO engagement letter', when: '12 min ago', badge: 'Signed', badgeTone: 'emerald' as BadgeTone },
  { icon: <Receipt size={15} />, tone: 'emerald' as AccentName, text: 'Invoice INV-2042 paid by Redwood Realty Partners', when: '1 hr ago', badge: '$27,000.00', badgeTone: 'emerald' as BadgeTone },
  { icon: <Upload size={15} />, tone: 'blue' as AccentName, text: 'Sarah Chen uploaded 3 documents to the 2026 Individual organizer', when: '3 hr ago', badge: 'New files', badgeTone: 'blue' as BadgeTone },
  { icon: <MessageSquare size={15} />, tone: 'violet' as AccentName, text: 'Harborview Dental Group asked about the Q4 estimate', when: 'Yesterday', badge: 'Unread', badgeTone: 'amber' as BadgeTone },
  { icon: <ClipboardList size={15} />, tone: 'teal' as AccentName, text: 'S-Corp organizer sent to Miller & Sons Construction', when: 'Yesterday', badge: 'Sent', badgeTone: 'blue' as BadgeTone },
];

function DashboardScreen({ firstName, firmName }: { firstName: string; firmName: string }) {
  return (
    <>
      <div className="pd-page-head">
        <div>
          <h3 className="pd-h1">
            Welcome back, <span className="pd-grad">{firstName}</span>
          </h3>
          <p className="pd-sub">Here&apos;s what&apos;s happening at {firmName} today.</p>
        </div>
        <PrimaryButton>
          <Plus size={15} /> New client
        </PrimaryButton>
      </div>

      <div className="pd-stats">
        <StatCard label="Documents" value="486" hint="+34 this week" icon={<FolderOpen size={15} />} tone="blue" />
        <StatCard label="Clients" value="58" hint="4 onboarding" icon={<Users size={15} />} tone="cyan" />
        <StatCard label="Outstanding" value="$49,250" hint="3 invoices open" icon={<Receipt size={15} />} tone="amber" />
        <StatCard label="Collected" value="$1.24M" hint="Year to date" icon={<CheckCircle2 size={15} />} tone="emerald" />
      </div>

      <div className="pd-two">
        <div className="pd-card">
          <SectionHeader>Revenue</SectionHeader>
          <div className="pd-rev">
            {[
              { label: 'This month', value: '$148,000', pct: 82, tone: 'blue' as AccentName },
              { label: 'Last month', value: '$121,500', pct: 67, tone: 'cyan' as AccentName },
              { label: 'Year to date', value: '$1.24M', pct: 100, tone: 'emerald' as AccentName },
            ].map((r) => (
              <div key={r.label} className="pd-rev-tile">
                <div className="pd-stat-label">{r.label}</div>
                <div className="pd-rev-value">{r.value}</div>
                <div className="pd-bar">
                  <span style={{ width: `${r.pct}%`, background: ACCENTS[r.tone] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pd-rev-foot">
            <span>
              <ArrowUpRight size={14} style={{ color: ACCENTS.emerald }} /> 22% vs. last month
            </span>
            <span className="pd-muted">Updated just now</span>
          </div>
        </div>

        <div className="pd-card">
          <SectionHeader action={<span className="pd-link">View all</span>}>Recent activity</SectionHeader>
          <ul className="pd-list">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="pd-row">
                <Chip tone={a.tone} size={34}>
                  {a.icon}
                </Chip>
                <div className="pd-row-body">
                  <div className="pd-row-text">{a.text}</div>
                  <div className="pd-row-meta">{a.when}</div>
                </div>
                <Badge tone={a.badgeTone}>{a.badge}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const INVOICES = [
  { client: 'Harborview Dental Group', no: 'INV-2041', amount: '$18,500.00', paid: '$18,500.00', status: 'Paid', tone: 'emerald' as BadgeTone, due: 'Sep 12, 2026' },
  { client: 'Redwood Realty Partners', no: 'INV-2042', amount: '$27,000.00', paid: '$27,000.00', status: 'Paid', tone: 'emerald' as BadgeTone, due: 'Sep 15, 2026' },
  { client: 'Ellis Mechanical', no: 'INV-2043', amount: '$19,500.00', paid: '$0.00', status: 'Sent', tone: 'blue' as BadgeTone, due: 'Oct 1, 2026' },
  { client: 'Miller & Sons Construction', no: 'INV-2044', amount: '$12,750.00', paid: '$0.00', status: 'Overdue', tone: 'rose' as BadgeTone, due: 'Sep 15, 2026' },
  { client: 'Brightline Physical Therapy', no: 'INV-2045', amount: '$34,000.00', paid: '$17,000.00', status: 'Partial', tone: 'amber' as BadgeTone, due: 'Oct 5, 2026' },
  { client: 'Cascade Orthodontics', no: 'INV-2046', amount: '$9,500.00', paid: '$0.00', status: 'Draft', tone: 'muted' as BadgeTone, due: 'Oct 15, 2026' },
];

function InvoicesScreen() {
  return (
    <>
      <div className="pd-page-head">
        <div>
          <h3 className="pd-h1">Invoices</h3>
          <p className="pd-sub">Send, track and collect — clients pay by card or bank right from the portal.</p>
        </div>
        <PrimaryButton>
          <Plus size={15} /> New Invoice
        </PrimaryButton>
      </div>

      <div className="pd-stats">
        <StatCard label="Outstanding" value="$49,250" hint="3 invoices" icon={<Receipt size={15} />} tone="amber" />
        <StatCard label="Overdue" value="$12,750" hint="1 invoice" icon={<AlertCircle size={15} />} tone="rose" />
        <StatCard label="Paid this month" value="$148,000" hint="11 invoices" icon={<CheckCircle2 size={15} />} tone="emerald" />
        <StatCard label="Drafts" value="1" hint="Ready to send" icon={<FileText size={15} />} tone="violet" />
      </div>

      <div className="pd-card pd-card-flush">
        <div className="pd-toolbar">
          <span className="pd-search">
            <Search size={14} />
            Search invoices
          </span>
          <span className="pd-filter">All statuses</span>
        </div>
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((r) => (
                <tr key={r.no}>
                  <td className="pd-strong">{r.client}</td>
                  <td className="pd-mono">{r.no}</td>
                  <td>{r.amount}</td>
                  <td className="pd-muted">{r.paid}</td>
                  <td>
                    <Badge tone={r.tone}>{r.status}</Badge>
                  </td>
                  <td className="pd-muted">{r.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Engagement letters                                                        */
/* ------------------------------------------------------------------------ */

type ServiceId = 'advisory' | 'cfo' | 'entity';

interface EngagementDemoState {
  step: 'list' | 'pick' | 'draft' | 'sent';
  service: ServiceId | null;
  /** Services sent during this session; newest first, prepended to the table. */
  sent: { service: ServiceId; client: string }[];
  /**
   * One-way: set the first time the visitor starts an engagement, and never
   * cleared. It gates the "try this" arrow.
   *
   * `step` cannot do this job — "Back to engagements" returns it to 'list', so
   * the arrow would reappear and nag someone who already tried it. `sent`
   * cannot either; it only catches people who ran the whole flow to the end.
   */
  touched: boolean;
}

const ENGAGEMENT_INITIAL: EngagementDemoState = {
  step: 'list',
  service: null,
  sent: [],
  touched: false,
};

const LETTER_CLIENT = 'Cascade Orthodontics';
const LETTER_CONTACT = 'Dr. Alicia Moreau';
const LETTER_EMAIL = 'amoreau@cascadeortho.example';
/**
 * Constant, deliberately. This component is `'use client'` but still server
 * renders, so a live `new Date()` desyncs on hydration.
 */
const LETTER_DATE = 'September 29, 2026';

const SERVICES: Record<
  ServiceId,
  {
    name: string;
    sub: string;
    fee: string;
    feeNote: string;
    term: string;
    termNote: string;
    scope: string[];
    terms: string[];
  }
> = {
  advisory: {
    name: 'Advisory Package',
    sub: 'Year-round planning for owners and high earners',
    fee: '$3,500',
    feeNote: 'per quarter',
    term: '12 months',
    termNote: 'Billed quarterly in advance, first instalment on signature',
    scope: [
      'Quarterly tax projection and a federal and state estimated-payment schedule',
      'Entity, owner compensation and retirement-contribution modelling',
      'Year-end planning memo delivered on or before December 15',
      'Two working sessions per quarter with your lead CPA',
      'Preparation of the business and owner returns for the covered year',
    ],
    terms: [
      'Fees are fixed for the twelve-month term and are not contingent on the tax result achieved.',
      'Either party may terminate on thirty days written notice; fees are prorated to the termination date and unearned amounts refunded.',
      'Evergreen relies on the completeness and accuracy of the information the Client provides and will not audit or independently verify it.',
      'Representation in an IRS or state examination is outside this engagement and is quoted separately before any work begins.',
    ],
  },
  cfo: {
    name: 'Fractional CFO',
    sub: 'A finance function without a finance hire',
    fee: '$6,500',
    feeNote: 'per month',
    term: '6-month initial term',
    termNote: 'Continues month to month thereafter',
    scope: [
      'Thirteen-week rolling cash-flow forecast, refreshed weekly',
      'Monthly close review and a board-ready reporting pack',
      'Budget, pricing and contribution-margin analysis by service line',
      'Lender and investor package preparation and support through diligence',
      'Monthly leadership meeting, with on-call advisory in between',
    ],
    terms: [
      'Services under this letter are advisory. Evergreen will not perform an audit, review or compilation of the Client financial statements.',
      'The initial term is six months. Thereafter the engagement continues month to month and either party may end it on thirty days notice.',
      'Work outside the scope above is quoted in writing and begins only on the Client written approval.',
      'The Client retains responsibility for all management decisions and for the accuracy of its underlying financial records.',
    ],
  },
  entity: {
    name: 'Entity Structure Review',
    sub: 'One-time restructuring analysis and implementation plan',
    fee: '$9,500',
    feeNote: 'fixed project fee',
    term: '30 days',
    termNote: 'From receipt of the final requested document',
    scope: [
      'Review of the current structure, ownership and basis across all related entities',
      'Modelling of S-corporation, partnership and holding-company alternatives',
      'Reasonable-compensation study with supporting market documentation',
      'Multi-state nexus and apportionment review for the group',
      'Written recommendation with implementation steps and a filing calendar',
    ],
    terms: [
      'Fifty percent of the fixed fee is due on signature; the balance on delivery of the written recommendation.',
      'The deliverable is an analysis and a plan. Formation, state filing and registered-agent costs are billed at cost as incurred.',
      'Conclusions are based on federal and state tax law in effect on the delivery date and are not updated for later changes.',
      'This letter does not engage Evergreen to prepare any tax return for the Client or its owners.',
    ],
  },
};

const SERVICE_ORDER: ServiceId[] = ['advisory', 'cfo', 'entity'];

const ENGAGEMENTS = [
  { to: 'Redwood Realty Partners', subject: 'Fractional CFO', status: 'Signed', tone: 'emerald' as BadgeTone, sent: 'Sep 8, 2026' },
  { to: 'Harborview Dental Group', subject: 'Advisory Package', status: 'Signed', tone: 'emerald' as BadgeTone, sent: 'Sep 3, 2026' },
  { to: 'Cascade Orthodontics', subject: 'Entity Structure Review', status: 'Viewed', tone: 'blue' as BadgeTone, sent: 'Sep 24, 2026' },
  { to: 'Miller & Sons Construction', subject: 'Advisory Package', status: 'Awaiting signature', tone: 'amber' as BadgeTone, sent: 'Sep 22, 2026' },
  { to: 'Ellis Mechanical', subject: 'Fractional CFO', status: 'Awaiting signature', tone: 'amber' as BadgeTone, sent: 'Sep 25, 2026' },
  { to: 'Brightline Physical Therapy', subject: 'Entity Structure Review', status: 'Draft', tone: 'muted' as BadgeTone, sent: '—' },
];

const LETTER_RAIL: { k: string; v: string }[] = [
  { k: 'Recipient', v: LETTER_CLIENT },
  { k: 'Signer', v: LETTER_CONTACT },
  { k: 'Delivery', v: 'Email + portal notification' },
  { k: 'Signature', v: 'Legally binding e-signature' },
  { k: 'Reminders', v: 'Automatic on day 3 and day 7' },
  { k: 'Countersigned', v: 'Yes, on client signature' },
];

/**
 * The engagement flow is the one interactive story in the demo, so its state
 * lives in `PortalDemo` (see `ENGAGEMENT_INITIAL`) rather than here — leaving
 * the tab and coming back must not erase a letter the prospect just sent.
 */
function EngagementsScreen({
  firmName,
  ownerName,
  state,
  onChange,
}: {
  firmName: string;
  ownerName?: string;
  state: EngagementDemoState;
  onChange: (next: EngagementDemoState) => void;
}) {
  const signer = ownerName || 'Dana Whitfield';
  const svc = state.service ? SERVICES[state.service] : null;

  const goList = () => onChange({ ...state, step: 'list', service: null });
  const goPick = () => onChange({ ...state, step: 'pick', service: null, touched: true });
  const pick = (id: ServiceId) => onChange({ ...state, step: 'draft', service: id });
  const send = () => {
    if (!state.service) return;
    onChange({
      ...state,
      step: 'sent',
      service: state.service,
      sent: [{ service: state.service, client: LETTER_CLIENT }, ...state.sent],
    });
  };

  const rows = [
    ...state.sent.map((r) => ({
      to: r.client,
      subject: SERVICES[r.service].name,
      status: 'Awaiting signature',
      tone: 'amber' as BadgeTone,
      sent: 'Just now',
      isNew: true,
    })),
    ...ENGAGEMENTS.map((r) => ({ ...r, isNew: false })),
  ];
  const awaiting = 2 + state.sent.length;

  return (
    <>
      {state.step === 'list' ? (
        <div className="pd-page-head">
          <div>
            <h3 className="pd-h1">Engagements</h3>
            <p className="pd-sub">Draft it, send it, get it signed — without leaving the portal.</p>
          </div>
          <div className="pd-nudge-row">
            {!state.touched && (
              <span className="pd-nudge" aria-hidden="true">
                <span className="pd-nudge-text">Try it — send one</span>
                <ArrowRight size={16} className="pd-nudge-arrow" />
              </span>
            )}
            <span className={state.touched ? undefined : 'pd-nudge-target'}>
              <ActionButton onClick={goPick}>
                <Plus size={15} /> New engagement
              </ActionButton>
            </span>
          </div>
        </div>
      ) : (
        <div className="pd-page-head">
          <div>
            <div className="pd-crumbs">
              <button type="button" className="pd-crumb-btn" onClick={goList}>
                <ArrowLeft size={12} /> Engagements
              </button>
              <span>/</span>
              <span>New engagement</span>
              {svc && (
                <>
                  <span>/</span>
                  <span>{svc.name}</span>
                </>
              )}
            </div>
            <h3 className="pd-h1">{svc ? svc.name : 'New engagement'}</h3>
            <p className="pd-sub">
              {svc
                ? svc.sub
                : 'Pick the service this letter covers. Each one carries its own scope, fee and terms.'}
            </p>
          </div>
        </div>
      )}

      <div className="pd-note">
        <Info size={14} />
        <span>
          Demo mode &mdash; this is a complete letter, laid out exactly as your clients receive it.
          Sending updates this screen only; no email leaves the building.
        </span>
      </div>

      {state.step === 'list' && (
        <>
          <div className="pd-stats">
            <StatCard label="Signed" value="28" hint="This year" icon={<FileSignature size={15} />} tone="emerald" />
            <StatCard label="Awaiting signature" value={String(awaiting)} hint="Reminders on" icon={<Clock size={15} />} tone="amber" />
            <StatCard label="Viewed" value="1" hint="Opened, unsigned" icon={<FileText size={15} />} tone="blue" />
            <StatCard label="Annualised value" value="$1.9M" hint="Signed engagements in force" icon={<ArrowUpRight size={15} />} tone="violet" />
          </div>

          <div className="pd-card pd-card-flush">
            <div className="pd-toolbar">
              <span className="pd-search">
                <Search size={14} />
                Search engagements
              </span>
              <span className="pd-filter">All statuses</span>
            </div>
            <div className="pd-table-wrap">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>Recipients</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} data-new={r.isNew ? 'true' : undefined}>
                      <td className="pd-strong">{r.to}</td>
                      <td>{r.subject}</td>
                      <td>
                        <Badge tone={r.tone}>{r.status}</Badge>
                      </td>
                      <td className="pd-muted">{r.sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {state.step === 'pick' && (
        <div className="pd-choices">
          {SERVICE_ORDER.map((id) => {
            const sv = SERVICES[id];
            return (
              <button
                key={id}
                type="button"
                className="pd-choice"
                data-selected={state.service === id}
                onClick={() => pick(id)}
              >
                <span className="pd-choice-title">{sv.name}</span>
                <span className="pd-choice-sub">{sv.sub}</span>
                <span className="pd-choice-fee">{sv.fee}</span>
                <span className="pd-choice-term">
                  {sv.feeNote} &middot; {sv.term}
                </span>
                <span className="pd-choice-cta">
                  Draft this letter <ArrowRight size={13} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {state.step === 'draft' && svc && (
        <div className="pd-doc-grid">
          <article className="pd-doc">
            <header className="pd-doc-head">
              <div>
                <div className="pd-doc-firm">{firmName}</div>
                <div className="pd-doc-kicker">Engagement Letter</div>
              </div>
              <Badge tone="amber">Draft &mdash; not sent</Badge>
            </header>

            <h4 className="pd-doc-title">{svc.name}</h4>
            <div className="pd-doc-meta">Prepared {LETTER_DATE} &middot; Reference EL-2026-118</div>

            <section className="pd-doc-sec">
              <div className="pd-doc-h">Parties</div>
              <p className="pd-doc-p">
                This letter confirms the terms on which <span className="pd-strong">{firmName}</span>{' '}
                (&ldquo;the Firm&rdquo;) will provide services to{' '}
                <span className="pd-strong">{LETTER_CLIENT}</span> (&ldquo;the Client&rdquo;), and is
                addressed to {LETTER_CONTACT}, Managing Partner.
              </p>
            </section>

            <section className="pd-doc-sec">
              <div className="pd-doc-h">Scope of work</div>
              <div className="pd-doc-list">
                {svc.scope.map((line) => (
                  <div key={line} className="pd-doc-li">
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="pd-doc-sec">
              <div className="pd-doc-h">Fee and payment terms</div>
              <div className="pd-doc-fee">
                <div className="pd-doc-fee-tile">
                  <div className="pd-stat-label">Professional fee</div>
                  <div className="pd-doc-fee-value">{svc.fee}</div>
                  <div className="pd-doc-meta">{svc.feeNote}</div>
                </div>
                <div className="pd-doc-fee-tile">
                  <div className="pd-stat-label">Engagement term</div>
                  <div className="pd-doc-fee-value">{svc.term}</div>
                  <div className="pd-doc-meta">{svc.termNote}</div>
                </div>
              </div>
              <p className="pd-doc-p">
                Invoices are issued from the Client portal and are payable by card or ACH on receipt.
                Balances outstanding after fifteen days accrue interest at 1.5% per month.
                Out-of-pocket costs are billed at cost and itemised.
              </p>
            </section>

            <section className="pd-doc-sec">
              <div className="pd-doc-h">Term and termination</div>
              <p className="pd-doc-p">
                {svc.termNote}. Either party may terminate this engagement by written notice as set
                out below. On termination the Firm will invoice for work performed to that date and
                will return or securely destroy Client records on request.
              </p>
            </section>

            <section className="pd-doc-sec">
              <div className="pd-doc-h">Terms and conditions</div>
              <ol className="pd-doc-ol">
                {svc.terms.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </section>

            <div className="pd-sign">
              <div>
                <div className="pd-doc-h">For {firmName}</div>
                <div className="pd-sign-rule" style={{ marginTop: '0.7rem' }}>
                  <span className="pd-sign-name">{signer}</span>
                </div>
                <div className="pd-sign-label">
                  {signer}, CPA &middot; Managing Partner &middot; Signed {LETTER_DATE}
                </div>
              </div>
              <div>
                <div className="pd-doc-h">For {LETTER_CLIENT}</div>
                <div className="pd-sign-rule" style={{ marginTop: '0.7rem' }} />
                <div className="pd-sign-label">{LETTER_CONTACT} &middot; Signature and date</div>
                <div style={{ marginTop: '0.45rem' }}>
                  <Badge tone="muted">Awaiting signature</Badge>
                </div>
              </div>
            </div>

            <div className="pd-doc-foot">
              <span>Page 1 of 1 &middot; {firmName}</span>
              <span>Sample document &mdash; generated for this demo</span>
            </div>
          </article>

          <div className="pd-rail">
            <div className="pd-card">
              <SectionHeader>Delivery</SectionHeader>
              {LETTER_RAIL.map((row) => (
                <div key={row.k} className="pd-kv">
                  <span className="pd-kv-k">{row.k}</span>
                  <span className="pd-kv-v">{row.v}</span>
                </div>
              ))}
              <div className="pd-actions">
                <ActionButton onClick={send}>
                  <Send size={15} /> Send for signature
                </ActionButton>
                <ActionButton variant="ghost" onClick={goPick}>
                  Choose a different service
                </ActionButton>
                <ActionButton variant="ghost" onClick={goList}>
                  Discard draft
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.step === 'sent' && (
        <div className="pd-card">
          <div className="pd-done">
            <span className="pd-done-mark">
              <CheckCircle2 size={28} />
            </span>
            <div className="pd-done-title">Engagement letter sent to {LETTER_CLIENT}</div>
            <p className="pd-done-sub">
              Delivered to {LETTER_EMAIL} and posted to their portal. Reminders are scheduled for
              October 2 and October 6. You will be notified the moment it is signed.
            </p>
            <Badge tone="amber">Awaiting signature</Badge>
            <div className="pd-done-actions">
              <ActionButton onClick={goList}>Back to engagements</ActionButton>
              <ActionButton variant="ghost" onClick={goPick}>
                Start another engagement
              </ActionButton>
            </div>
            <p className="pd-muted" style={{ fontSize: 11 }}>
              Nothing was actually sent &mdash; this is a demo firm.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Tax organizers                                                            */
/* ------------------------------------------------------------------------ */

type EntityId = 'individual' | 'scorp' | 'ccorp' | 'partnership';

const ENTITY_LABEL: Record<EntityId, string> = {
  individual: 'Individual',
  scorp: 'S-Corp',
  ccorp: 'C-Corp',
  partnership: 'Partnership',
};

const ENTITY_ORDER: EntityId[] = ['individual', 'scorp', 'ccorp', 'partnership'];

const ORGANIZERS: Record<EntityId, { questions: string[]; docs: string[]; received: number }> = {
  individual: {
    received: 7,
    questions: [
      'Did your marital status or dependents change in 2026?',
      'Did you buy, sell or refinance a primary or second home?',
      'Any crypto, private placements or brokerage activity outside your linked accounts?',
      'Which states did you make estimated payments to, and when?',
      'Did you have rental income, and was it actively or passively managed?',
    ],
    docs: [
      'W-2s from all employers',
      '1099-INT and 1099-DIV',
      '1099-B brokerage year-end summary',
      '1099-R retirement distributions',
      'SSA-1099',
      'Schedule K-1s received',
      'Form 1098 mortgage interest',
      'Property tax statements',
      'Charitable contribution receipts over $250',
      'Form 5498-SA (HSA)',
      'Childcare provider statement and EIN',
      'Prior-year federal and state returns',
    ],
  },
  scorp: {
    received: 6,
    questions: [
      'Did shareholder ownership percentages change at any point in the year?',
      'What was each shareholder’s W-2 wage and health insurance add-back?',
      'Were distributions made, to whom and in what amounts?',
      'Did the company add payroll in any new state?',
      'Are there loans outstanding between the company and its shareholders?',
    ],
    docs: [
      'Year-end trial balance',
      'Profit and loss and balance sheet',
      'December bank and credit card statements',
      'Payroll returns (941s, W-3, state)',
      'Shareholder wage and health insurance detail',
      'Fixed asset additions and disposals',
      'Loan statements and amortisation schedules',
      'Distribution ledger by shareholder',
      'Prior-year Form 1120-S and K-1s',
      'State registrations and nexus summary',
    ],
  },
  ccorp: {
    received: 4,
    questions: [
      'Any changes to officers, ownership or capital stock?',
      'Were dividends declared or paid during the year?',
      'Do you have deferred tax items or NOL carryforwards to roll forward?',
      'Was there R&D activity that may qualify for the credit?',
      'Are there related-party or intercompany transactions to document?',
    ],
    docs: [
      'Audited or internally prepared financial statements',
      'Year-end trial balance',
      'Depreciation and fixed asset schedule',
      'Payroll returns and W-3',
      'Dividend and stock transaction records',
      'Loan agreements and interest schedules',
      'Deferred tax and NOL carryforward schedules',
      'R&D expense detail by project',
      'Intercompany and related-party agreements',
      'Prior-year Form 1120',
      'State apportionment data',
    ],
  },
  partnership: {
    received: 8,
    questions: [
      'Did any partner join, leave or change their percentage?',
      'Were guaranteed payments made, and to whom?',
      'Were there contributions or distributions of property rather than cash?',
      'Did the partnership take on or repay debt this year?',
      'Is a Section 754 election in place, or should one be considered?',
    ],
    docs: [
      'Partnership agreement and all amendments',
      'Year-end trial balance',
      'Profit and loss and balance sheet',
      'Partner capital account roll-forward',
      'Guaranteed payment schedule',
      'Contribution and distribution ledger',
      'Debt schedule split recourse / nonrecourse',
      'Fixed asset additions and disposals',
      'Prior-year Form 1065 and K-1s',
      'State filing and withholding detail',
    ],
  },
};

const ORGANIZER_ROWS = [
  { client: 'Harborview Dental Group', entity: 'S-Corp', docs: '10 of 10', status: 'Complete', tone: 'emerald' as BadgeTone, sent: 'Sep 6, 2026' },
  { client: 'Cascade Orthodontics', entity: 'C-Corp', docs: '11 of 11', status: 'Complete', tone: 'emerald' as BadgeTone, sent: 'Aug 29, 2026' },
  { client: 'Redwood Realty Partners', entity: 'Partnership', docs: '8 of 10', status: 'In progress', tone: 'blue' as BadgeTone, sent: 'Sep 14, 2026' },
  { client: 'Sarah Chen', entity: 'Individual', docs: '7 of 12', status: 'In progress', tone: 'blue' as BadgeTone, sent: 'Sep 18, 2026' },
  { client: 'Brightline Physical Therapy', entity: 'C-Corp', docs: '4 of 11', status: 'Awaiting client', tone: 'amber' as BadgeTone, sent: 'Sep 24, 2026' },
  { client: 'Miller & Sons Construction', entity: 'S-Corp', docs: '2 of 10', status: 'Awaiting client', tone: 'amber' as BadgeTone, sent: 'Sep 22, 2026' },
  { client: 'Lakeside Veterinary', entity: 'Individual', docs: '0 of 12', status: 'Sent', tone: 'muted' as BadgeTone, sent: 'Sep 26, 2026' },
];

function OrganizerScreen() {
  const [entity, setEntity] = useState<EntityId>('individual');
  const o = ORGANIZERS[entity];
  const total = o.docs.length;
  const pct = Math.round((o.received / total) * 100);

  return (
    <>
      <div className="pd-page-head">
        <div>
          <h3 className="pd-h1">Tax organizers</h3>
          <p className="pd-sub">
            One link. The organizer asks the questions that matter for their entity and requests
            exactly the documents that return needs &mdash; nothing else.
          </p>
        </div>
        <PrimaryButton>
          <Plus size={15} /> New organizer
        </PrimaryButton>
      </div>

      <div className="pd-stats">
        <StatCard label="Organizers sent" value="38" hint="This season" icon={<ClipboardList size={15} />} tone="cyan" />
        <StatCard label="Completed" value="24" hint="63% of sent" icon={<CheckCircle2 size={15} />} tone="emerald" />
        <StatCard label="Awaiting documents" value="11" hint="Reminders on" icon={<Clock size={15} />} tone="amber" />
        <StatCard label="Avg. days to complete" value="4.2" hint="Down from 11" icon={<ArrowUpRight size={15} />} tone="violet" />
      </div>

      <div className="pd-card">
        <SectionHeader>Organizer contents</SectionHeader>
        <div className="pd-seg" role="group" aria-label="Entity type">
          {ENTITY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className="pd-seg-btn"
              aria-pressed={entity === id}
              onClick={() => setEntity(id)}
            >
              {ENTITY_LABEL[id]}
            </button>
          ))}
        </div>

        <div className="pd-org-grid">
          <div>
            <div className="pd-org-h">Questions we ask</div>
            <ul>
              {o.questions.map((q, i) => (
                <li key={q} className="pd-q">
                  <span className="pd-q-n">{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            <div className="pd-progress">
              <div className="pd-progress-top">
                <span className="pd-muted">
                  {o.received} of {total} documents received
                </span>
                <span className="pd-progress-pct">{pct}%</span>
              </div>
              <div className="pd-bar">
                <span style={{ width: `${pct}%`, background: ACCENTS.emerald }} />
              </div>
              <p className="pd-progress-note">
                {ENTITY_LABEL[entity]} filers are asked for {total} documents. Reminders go out
                automatically until every one is in.
              </p>
            </div>
          </div>
          <div>
            <div className="pd-org-h">Documents requested</div>
            <ul>
              {o.docs.map((d, i) => (
                <li key={d} className="pd-check" data-done={i < o.received}>
                  <span className="pd-check-box">
                    <Check size={12} />
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="pd-card pd-card-flush">
        <div className="pd-toolbar">
          <span className="pd-search">
            <Search size={14} />
            Search organizers
          </span>
          <span className="pd-filter">All entities</span>
        </div>
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Entity</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {ORGANIZER_ROWS.map((r) => (
                <tr key={r.client}>
                  <td className="pd-strong">{r.client}</td>
                  <td className="pd-muted">{r.entity}</td>
                  <td className="pd-mono">{r.docs}</td>
                  <td>
                    <Badge tone={r.tone}>{r.status}</Badge>
                  </td>
                  <td className="pd-muted">{r.sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ClientScreen({ clientFirst, firmName }: { clientFirst: string; firmName: string }) {
  const actions = [
    { icon: <FileSignature size={15} />, tone: 'amber' as AccentName, title: 'Sign your Fractional CFO engagement letter', meta: `$6,500 per month · from ${firmName}`, badge: 'Action needed', badgeTone: 'amber' as BadgeTone },
    { icon: <Upload size={15} />, tone: 'blue' as AccentName, title: 'Upload your Q3 bank statements', meta: '2026 S-Corp organizer · 7 of 10 documents received', badge: 'In progress', badgeTone: 'blue' as BadgeTone },
    { icon: <Receipt size={15} />, tone: 'rose' as AccentName, title: 'Invoice INV-2043 due', meta: '$19,500.00 · Q4 advisory retainer', badge: 'Due Oct 1', badgeTone: 'rose' as BadgeTone },
  ];
  return (
    <>
      <div className="pd-page-head">
        <div>
          <h3 className="pd-h1">
            Welcome back, <span className="pd-grad">{clientFirst}</span>
          </h3>
          <p className="pd-sub">Everything with {firmName} in one secure place.</p>
        </div>
        <PrimaryButton>
          <Upload size={15} /> Upload documents
        </PrimaryButton>
      </div>

      <div className="pd-stats">
        <StatCard label="Balance Due" value="$19,500" hint="Invoice INV-2043" icon={<Receipt size={15} />} tone="amber" />
        <StatCard label="Documents" value="26" hint="6 added this month" icon={<FolderOpen size={15} />} tone="blue" />
        <StatCard label="Pending Signatures" value="1" hint="Fractional CFO letter" icon={<FileSignature size={15} />} tone="violet" />
        <StatCard label="Tax Returns" value="2" hint="2025 filed · 2026 planning live" icon={<FileText size={15} />} tone="emerald" />
      </div>

      <div className="pd-two">
        <div className="pd-card">
          <SectionHeader>Action items</SectionHeader>
          <ul className="pd-list">
            {actions.map((a) => (
              <li key={a.title} className="pd-row">
                <Chip tone={a.tone} size={34}>
                  {a.icon}
                </Chip>
                <div className="pd-row-body">
                  <div className="pd-row-text pd-strong">{a.title}</div>
                  <div className="pd-row-meta">{a.meta}</div>
                </div>
                <Badge tone={a.badgeTone}>{a.badge}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="pd-card">
          <SectionHeader action={<span className="pd-link">Open inbox</span>}>Messages</SectionHeader>
          <ul className="pd-list">
            {[
              { from: firmName, text: 'We have the Q3 statements — one question on the owner comp before we finalise the projection.', when: 'Today', unread: true },
              { from: firmName, text: 'Your 2025 return has been e-filed. Confirmation attached.', when: 'Aug 14', unread: false },
              { from: 'You', text: 'Attached the brokerage statements you asked for.', when: 'Aug 12', unread: false },
            ].map((m, i) => (
              <li key={i} className="pd-row">
                <span className="pd-avatar pd-avatar-sm" aria-hidden="true">
                  {initials(m.from)}
                </span>
                <div className="pd-row-body">
                  <div className="pd-row-text">
                    <span className="pd-strong">{m.from}</span>
                    <span className="pd-muted"> · {m.when}</span>
                  </div>
                  <div className="pd-row-meta">{m.text}</div>
                </div>
                {m.unread && <Badge tone="blue">New</Badge>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Shell                                                                     */
/* ------------------------------------------------------------------------ */

const FIRM_NAV: { label: string; icon: React.ReactNode; tone: AccentName; key: string }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} />, tone: 'blue' },
  { key: 'clients', label: 'Clients', icon: <Users size={15} />, tone: 'cyan' },
  { key: 'messages', label: 'Client Messages', icon: <MessageSquare size={15} />, tone: 'violet' },
  { key: 'documents', label: 'Documents', icon: <FolderOpen size={15} />, tone: 'teal' },
  { key: 'engagements', label: 'Engagements', icon: <FileSignature size={15} />, tone: 'emerald' },
  { key: 'invoices', label: 'Invoices', icon: <Receipt size={15} />, tone: 'amber' },
  { key: 'returns', label: 'Tax Returns', icon: <FileText size={15} />, tone: 'blue' },
  { key: 'organizers', label: 'Tax Organizers', icon: <ClipboardList size={15} />, tone: 'cyan' },
  { key: 'settings', label: 'Settings', icon: <Settings size={15} />, tone: 'violet' },
];

const CLIENT_NAV: typeof FIRM_NAV = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} />, tone: 'blue' },
  { key: 'documents', label: 'Documents', icon: <FolderOpen size={15} />, tone: 'teal' },
  { key: 'messages', label: 'Messages', icon: <MessageSquare size={15} />, tone: 'violet' },
  { key: 'invoices', label: 'Invoices', icon: <Receipt size={15} />, tone: 'amber' },
  { key: 'engagements', label: 'Engagement letters', icon: <FileSignature size={15} />, tone: 'emerald' },
  { key: 'returns', label: 'Tax returns', icon: <FileText size={15} />, tone: 'blue' },
  { key: 'settings', label: 'Settings', icon: <Settings size={15} />, tone: 'cyan' },
];

const ACTIVE_BY_TAB: Record<TabId, string> = {
  dashboard: 'overview',
  engagements: 'engagements',
  invoices: 'invoices',
  organizer: 'organizers',
  client: 'overview',
};

const CSS = `
.pd {
  --pd-radius: 0.5rem;
  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  color: var(--pd-text);
  -webkit-font-smoothing: antialiased;
}
.pd * { box-sizing: border-box; }
.pd p { margin: 0; color: inherit; }
/* The host page's global heading rule wins over .pd's inherited color; pin it. */
.pd h1, .pd h2, .pd h3, .pd h4, .pd h5, .pd h6 { color: var(--pd-text); }
.pd ul { list-style: none; margin: 0; padding: 0; }
.pd-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  margin-bottom: 14px;
  scrollbar-width: none;
}
.pd-tabs::-webkit-scrollbar { display: none; }
.pd-tab {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,0.65);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.pd-tab:hover { color: #fff; }
.pd-tab[aria-selected="true"] { background: #2563eb; color: #fff; box-shadow: 0 6px 20px -8px rgba(37,99,235,0.8); }
.pd-frame {
  display: flex;
  min-height: 600px;
  border-radius: 1rem;
  overflow: hidden;
  background: var(--pd-bg);
  border: 1px solid var(--pd-border);
  box-shadow: 0 40px 100px -40px rgba(0,0,0,0.7);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.pd-sidebar {
  width: 240px;
  flex: 0 0 240px;
  display: flex;
  flex-direction: column;
  background: var(--pd-nav);
  border-right: 1px solid var(--pd-border);
}
.pd-logo-row {
  height: 4rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--pd-border);
  min-width: 0;
}
.pd-logo-img { height: 30px; width: auto; max-width: 150px; object-fit: contain; }
.pd-wordmark {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pd-pill-row { padding: 0.875rem 1rem 0.25rem; }
.pd-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 1.5px;
  overflow: hidden;
  isolation: isolate;
}
.pd-pill-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 220%;
  aspect-ratio: 1 / 1;
  z-index: -2;
  /* Three stops, not two: green -> gold -> pale champagne -> green reads as a
     metallic sweep, where a two-colour cycle just flickers between them. */
  background: conic-gradient(from 90deg at 50% 50%, var(--pd-accent) 0%, var(--pd-accent2) 22%, var(--pd-accent3) 34%, var(--pd-accent2) 46%, var(--pd-accent) 62%, var(--pd-accent2) 84%, var(--pd-accent) 100%);
  animation: pd-spin 3s linear infinite;
}
.pd-pill-inner { position: absolute; inset: 1.5px; z-index: -1; border-radius: 999px; background: var(--pd-nav); }
.pd-pill-text {
  position: relative;
  padding: 0.3rem 0.7rem;
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pd-text);
}
@keyframes pd-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
.pd-nav { padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 2px; flex: 1; }
.pd-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: var(--pd-radius);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--pd-muted);
  cursor: default;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.pd-nav-item:hover { background: var(--pd-hover); color: var(--pd-text); }
.pd-nav-item[data-active="true"] { background: rgba(var(--pd-accent-rgb), 0.12); color: var(--pd-text); }
.pd-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  flex: 0 0 auto;
}
.pd-nav-item .pd-chip { width: 28px; height: 28px; border-radius: 0.5rem; }
.pd-side-foot {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--pd-border);
  min-width: 0;
}
.pd-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--pd-accent), var(--pd-accent2));
}
.pd-avatar-sm { width: 30px; height: 30px; font-size: 0.6875rem; }
.pd-foot-name { font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pd-foot-role { font-size: 0.6875rem; color: var(--pd-muted); }
.pd-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pd-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  height: 3.5rem;
  padding: 0 1rem;
  background: var(--pd-nav);
  border-bottom: 1px solid var(--pd-border);
}
.pd-topbar-brand { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
.pd-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  height: 4rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--pd-border);
}
.pd-search {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 34px;
  padding: 0 0.75rem;
  border-radius: var(--pd-radius);
  background: var(--pd-input);
  border: 1px solid var(--pd-border);
  color: var(--pd-muted);
  font-size: 0.8125rem;
  min-width: 200px;
}
.pd-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--pd-radius);
  border: 1px solid var(--pd-border);
  background: var(--pd-card);
  color: var(--pd-muted);
}
.pd-icon-btn .pd-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 999px; background: #f43f5e; }
.pd-content { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.pd-page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.pd-h1 { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; font-family: inherit; }
.pd-sub { margin-top: 0.25rem; font-size: 0.875rem; color: var(--pd-muted); }
.pd-grad {
  background-image: linear-gradient(90deg, var(--pd-accent), var(--pd-accent2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
.pd-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.95rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--pd-accent) 0%, var(--pd-accent) 45%, var(--pd-accent2) 140%);
  white-space: nowrap;
  cursor: default;
  flex: 0 0 auto;
}
.pd-card {
  background: var(--pd-card);
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius);
  padding: 1.125rem 1.25rem;
}
.pd-card-flush { padding: 0; overflow: hidden; }
.pd-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.875rem; }
.pd-stat-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.pd-stat-label { font-size: 0.8125rem; color: var(--pd-muted); }
.pd-stat-value { margin-top: 0.5rem; font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
.pd-stat-hint { margin-top: 0.25rem; font-size: 0.75rem; color: var(--pd-muted); }
.pd-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem; }
.pd-section-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; }
.pd-section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--pd-muted); font-weight: 600; }
.pd-link { font-size: 0.75rem; font-weight: 600; color: var(--pd-accent); }
.pd-rev { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
.pd-rev-tile { padding: 0.75rem; border-radius: var(--pd-radius); background: var(--pd-input); border: 1px solid var(--pd-border); }
.pd-rev-value { margin-top: 0.25rem; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.03em; }
.pd-bar { margin-top: 0.6rem; height: 6px; border-radius: 999px; background: rgba(var(--pd-accent-rgb), 0.12); overflow: hidden; }
.pd-bar span { display: block; height: 100%; border-radius: 999px; }
.pd-rev-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 0.875rem; font-size: 0.8125rem; }
.pd-rev-foot > span { display: inline-flex; align-items: center; gap: 0.3rem; }
.pd-list { display: flex; flex-direction: column; }
.pd-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-top: 1px solid var(--pd-border); }
.pd-row:first-child { border-top: 0; padding-top: 0; }
.pd-row-body { flex: 1; min-width: 0; }
.pd-row-text { font-size: 0.8125rem; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pd-row-meta { font-size: 0.75rem; color: var(--pd-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pd-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex: 0 0 auto;
}
.pd-strong { font-weight: 600; color: var(--pd-text); }
.pd-muted { color: var(--pd-muted); }
.pd-mono { font-variant-numeric: tabular-nums; }
.pd-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.875rem 1rem; border-bottom: 1px solid var(--pd-border); }
.pd-filter { font-size: 0.8125rem; color: var(--pd-muted); padding: 0.4rem 0.75rem; border: 1px solid var(--pd-border); border-radius: var(--pd-radius); background: var(--pd-input); white-space: nowrap; }
.pd-table-wrap { overflow-x: auto; }
.pd-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; min-width: 640px; }
.pd-table th {
  text-align: left;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--pd-muted);
  font-weight: 600;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--pd-border);
  white-space: nowrap;
}
.pd-table td { padding: 0.8rem 1rem; border-bottom: 1px solid var(--pd-border); white-space: nowrap; }
.pd-table tbody tr:last-child td { border-bottom: 0; }
.pd-table tbody tr:hover td { background: var(--pd-hover); }

/* --- real buttons -------------------------------------------------- */
.pd-btn { appearance: none; border: 0; font: inherit; cursor: pointer; }
.pd-btn-primary.pd-btn { cursor: pointer; }
.pd-btn-primary.pd-btn:hover { filter: brightness(1.07); }
.pd-btn-primary.pd-btn:active { transform: translateY(1px); }
.pd-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 0.9rem; border-radius: var(--pd-radius);
  font: inherit; font-size: 0.8125rem; font-weight: 600;
  color: var(--pd-muted); background: transparent;
  border: 1px solid var(--pd-border); appearance: none; cursor: pointer;
  transition: background-color .15s ease, color .15s ease, border-color .15s ease;
}
.pd-btn-ghost:hover { background: var(--pd-hover); color: var(--pd-text); border-color: rgba(var(--pd-accent-rgb), 0.4); }
.pd button:focus-visible { outline: 2px solid var(--pd-accent); outline-offset: 2px; border-radius: var(--pd-radius); }

/* --- breadcrumbs + demo note --------------------------------------- */
.pd-crumbs { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--pd-muted); margin-bottom: 0.35rem; flex-wrap: wrap; }
.pd-crumb-btn { appearance: none; border: 0; background: transparent; font: inherit; font-size: 0.75rem; font-weight: 600; color: var(--pd-accent); cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 0.2rem; }
.pd-crumb-btn:hover { text-decoration: underline; }
.pd-note { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.625rem 0.75rem; border-radius: var(--pd-radius); border: 1px dashed var(--pd-border); background: rgba(var(--pd-accent-rgb), 0.05); font-size: 0.75rem; line-height: 1.5; color: var(--pd-muted); }
.pd-note svg { flex: 0 0 auto; margin-top: 2px; color: var(--pd-accent); }

/* --- selectable option cards (service picker) ----------------------- */
.pd-choices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.875rem; }
.pd-choice {
  appearance: none; font: inherit; text-align: left; cursor: pointer;
  display: flex; flex-direction: column; gap: 0.55rem;
  padding: 1.25rem; border-radius: var(--pd-radius);
  background: var(--pd-card); border: 1px solid var(--pd-border); color: var(--pd-text);
  transition: border-color .15s ease, background-color .15s ease, transform .15s ease;
}
.pd-choice:hover { border-color: rgba(var(--pd-accent-rgb), 0.55); transform: translateY(-2px); }
.pd-choice[data-selected="true"] { border-color: var(--pd-accent); background: rgba(var(--pd-accent-rgb), 0.07); box-shadow: inset 0 0 0 1px rgba(var(--pd-accent-rgb), 0.35); }
.pd-choice-title { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }
.pd-choice-sub { font-size: 0.75rem; line-height: 1.45; color: var(--pd-muted); }
.pd-choice-fee { margin-top: 0.15rem; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.03em; }
.pd-choice-term { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pd-muted); }
.pd-choice-cta { margin-top: auto; padding-top: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--pd-accent); display: inline-flex; align-items: center; gap: 0.25rem; }

/* --- segmented selector (entity type) ------------------------------- */
.pd-seg { display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; border-radius: 999px; background: var(--pd-input); border: 1px solid var(--pd-border); }
.pd-seg-btn { appearance: none; border: 0; background: transparent; font: inherit; font-size: 0.8125rem; font-weight: 600; color: var(--pd-muted); padding: 0.4rem 0.9rem; border-radius: 999px; cursor: pointer; white-space: nowrap; transition: background-color .15s ease, color .15s ease, box-shadow .15s ease; }
.pd-seg-btn:hover { color: var(--pd-text); }
.pd-seg-btn[aria-pressed="true"] { background: rgba(var(--pd-accent-rgb), 0.16); color: var(--pd-text); box-shadow: inset 0 0 0 1px rgba(var(--pd-accent-rgb), 0.5); }

/* --- the engagement letter ------------------------------------------ */
.pd-doc-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); gap: 0.875rem; align-items: start; }
.pd-doc { background: var(--pd-card); border: 1px solid var(--pd-border); border-radius: var(--pd-radius); padding: 1.75rem 1.9rem; max-height: 560px; overflow-y: auto; box-shadow: 0 18px 40px -34px rgba(0,0,0,0.6); }
.pd-doc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding-bottom: 0.9rem; border-bottom: 2px solid var(--pd-accent); }
.pd-doc-firm { font-size: 1.0625rem; font-weight: 700; letter-spacing: -0.02em; }
.pd-doc-kicker { margin-top: 2px; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--pd-muted); }
.pd-doc-title { margin: 1.25rem 0 0; font-size: 1.1875rem; font-weight: 700; letter-spacing: -0.02em; }
.pd-doc-meta { margin-top: 0.25rem; font-size: 0.75rem; color: var(--pd-muted); }
.pd-doc-sec { margin-top: 1.35rem; }
.pd-doc-h { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--pd-accent); }
.pd-doc-p { margin-top: 0.4rem; font-size: 0.8125rem; line-height: 1.65; }
.pd-doc-list { margin-top: 0.55rem; display: flex; flex-direction: column; gap: 0.4rem; }
.pd-doc-li { display: flex; gap: 0.55rem; font-size: 0.8125rem; line-height: 1.55; }
.pd-doc-li::before { content: ""; flex: 0 0 auto; width: 5px; height: 5px; margin-top: 0.5rem; border-radius: 999px; background: var(--pd-accent); }
.pd-doc-ol { margin-top: 0.55rem; padding-left: 1.15rem; list-style: decimal; }
.pd-doc-ol li { margin-bottom: 0.4rem; padding-left: 0.15rem; font-size: 0.78125rem; line-height: 1.6; color: var(--pd-muted); }
.pd-doc-fee { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-top: 0.6rem; }
.pd-doc-fee-tile { padding: 0.7rem 0.85rem; border-radius: var(--pd-radius); background: var(--pd-input); border: 1px solid var(--pd-border); }
.pd-doc-fee-value { margin-top: 0.15rem; font-size: 1.125rem; font-weight: 700; letter-spacing: -0.02em; }
.pd-sign { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin-top: 1.6rem; padding-top: 1.25rem; border-top: 1px solid var(--pd-border); }
.pd-sign-rule { height: 36px; display: flex; align-items: flex-end; border-bottom: 1px solid var(--pd-text); opacity: 0.5; }
.pd-sign-name { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 1.3125rem; line-height: 1; padding-bottom: 2px; }
.pd-sign-label { margin-top: 0.4rem; font-size: 0.6875rem; letter-spacing: 0.02em; color: var(--pd-muted); line-height: 1.5; }
.pd-doc-foot { margin-top: 1.5rem; padding-top: 0.75rem; border-top: 1px solid var(--pd-border); display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.6875rem; color: var(--pd-muted); }

/* --- rail ------------------------------------------------------------ */
.pd-rail { display: flex; flex-direction: column; gap: 0.875rem; }
.pd-kv { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; padding: 0.45rem 0; border-top: 1px solid var(--pd-border); font-size: 0.8125rem; }
.pd-kv:first-of-type { border-top: 0; padding-top: 0; }
.pd-kv-k { color: var(--pd-muted); }
.pd-kv-v { font-weight: 600; text-align: right; }
.pd-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.9rem; }
.pd-actions > * { width: 100%; justify-content: center; }

/* --- sent confirmation ----------------------------------------------- */
.pd-done { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; padding: 3rem 1.5rem; }
.pd-done-mark { width: 60px; height: 60px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: rgba(16,185,129,0.14); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
.pd-done-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
.pd-done-sub { max-width: 46ch; font-size: 0.875rem; line-height: 1.6; color: var(--pd-muted); }
.pd-done-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 0.5rem; }

/* --- newly sent row --------------------------------------------------- */
.pd-table tbody tr[data-new="true"] td { background: rgba(var(--pd-accent-rgb), 0.07); }
.pd-table tbody tr[data-new="true"] td:first-child { box-shadow: inset 3px 0 0 var(--pd-accent); }

/* --- organizer --------------------------------------------------------- */
.pd-org-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin-top: 1.1rem; align-items: start; }
.pd-org-h { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--pd-muted); margin-bottom: 0.5rem; }
.pd-q { display: flex; gap: 0.55rem; padding: 0.45rem 0; border-top: 1px solid var(--pd-border); font-size: 0.8125rem; line-height: 1.45; }
.pd-q:first-of-type { border-top: 0; padding-top: 0; }
.pd-q-n { flex: 0 0 auto; width: 18px; height: 18px; margin-top: 1px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; background: rgba(var(--pd-accent-rgb), 0.12); color: var(--pd-accent); }
.pd-check { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.45rem 0; border-top: 1px solid var(--pd-border); font-size: 0.8125rem; line-height: 1.4; color: var(--pd-muted); }
.pd-check:first-of-type { border-top: 0; padding-top: 0; }
.pd-check[data-done="true"] { color: var(--pd-text); }
.pd-check-box { flex: 0 0 auto; width: 18px; height: 18px; margin-top: 1px; border-radius: 5px; border: 1px solid var(--pd-border); display: inline-flex; align-items: center; justify-content: center; color: transparent; }
.pd-check[data-done="true"] .pd-check-box { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.35); color: #34d399; }
.pd-progress { margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid var(--pd-border); }
.pd-progress-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; font-size: 0.8125rem; }
.pd-progress-pct { font-weight: 700; letter-spacing: -0.02em; }
.pd-progress-note { margin-top: 0.6rem; font-size: 0.75rem; line-height: 1.5; color: var(--pd-muted); }
/* The one interactive control in the frame is easy to miss, so point at it
   until the visitor actually uses it (EngagementDemoState.touched). */
.pd-nudge-row { display: inline-flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; justify-content: flex-end; }
/* A filled pill rather than bare text — this has to survive sitting next to a
   saturated gradient button without disappearing beside it. */
.pd-nudge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: var(--pd-accent);
  background: rgba(var(--pd-accent-rgb), 0.12);
  border: 1px solid rgba(var(--pd-accent-rgb), 0.4);
}
.pd-nudge-text { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
.pd-nudge-arrow { animation: pd-nudge 1.2s ease-in-out infinite; }
@keyframes pd-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }

/* The label alone still let the eye slide past the control it is pointing at,
   so the button gets its own expanding halo. ::after keeps it out of the DOM. */
.pd-nudge-target { position: relative; display: inline-flex; }
.pd-nudge-target::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 0.7rem;
  border: 2px solid var(--pd-accent);
  animation: pd-halo 1.8s ease-out infinite;
  pointer-events: none;
}
@keyframes pd-halo {
  0% { opacity: 0.85; transform: scale(1); }
  70%, 100% { opacity: 0; transform: scale(1.16); }
}

/* Nothing in this island respected reduced motion before — covers the new
   arrow and the sidebar shimmer pill together. */
@media (prefers-reduced-motion: reduce) {
  .pd-nudge-arrow, .pd-nudge-target::after, .pd-pill-spin { animation: none !important; }
  /* The halo is only legible as motion; a static ring just looks like a bug. */
  .pd-nudge-target::after { display: none; }
}

@media (max-width: 899px) {
  .pd-sidebar { display: none; }
  .pd-topbar { display: flex; }
  .pd-header { display: none; }
  .pd-content { padding: 1rem; }
  .pd-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pd-two { grid-template-columns: 1fr; }
  .pd-rev { grid-template-columns: 1fr; }
  .pd-h1 { font-size: 1.25rem; }
  .pd-frame { min-height: 0; }
  .pd-doc-grid, .pd-choices, .pd-org-grid, .pd-sign, .pd-doc-fee { grid-template-columns: 1fr; }
  .pd-doc { padding: 1.25rem; max-height: none; }
}
@media (max-width: 480px) {
  .pd-stats { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .pd-stat-value { font-size: 1.4rem; }
  .pd-btn-primary { padding: 0.5rem 0.75rem; font-size: 0.8125rem; }
}
`;

export default function PortalDemo({
  firmName,
  logoUrl,
  accent,
  accent2,
  theme,
  clientName = 'Jordan Ellis',
  ownerName,
  className = '',
}: PortalDemoProps) {
  const [tab, setTab] = useState<TabId>('dashboard');
  // Lives here, not in EngagementsScreen: leaving the tab and coming back must
  // not erase a letter the prospect just sent.
  const [engagement, setEngagement] = useState<EngagementDemoState>(ENGAGEMENT_INITIAL);
  const t = TOKENS[theme];
  const a1 = accent && hexToRgb(accent) ? accent : ACCENTS.blue;
  const a2 = accent2 && hexToRgb(accent2) ? accent2 : ACCENTS.cyan;
  const isClient = tab === 'client';
  const nav = isClient ? CLIENT_NAV : FIRM_NAV;
  const active = ACTIVE_BY_TAB[tab];
  const ownerFirst = firstNameOf(ownerName, 'there');
  const clientFirst = firstNameOf(clientName, 'Jordan');
  const footName = isClient ? clientName : ownerName || firmName;
  const footRole = isClient ? 'Client' : 'Owner';

  const vars = {
    '--pd-bg': t.bg,
    '--pd-card': t.card,
    '--pd-border': t.border,
    '--pd-text': t.text,
    '--pd-muted': t.muted,
    '--pd-nav': t.nav,
    '--pd-input': t.input,
    '--pd-hover': t.hover,
    '--pd-accent': a1,
    '--pd-accent2': a2,
    '--pd-accent3': lighten(a2, 0.55),
    '--pd-accent-rgb': hexToRgb(a1) ?? '37, 99, 235',
  } as React.CSSProperties;

  const brand = (
    <>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`${firmName} logo`} className="pd-logo-img" />
      ) : (
        <span className="pd-wordmark">{firmName}</span>
      )}
    </>
  );

  return (
    <div className={`pd ${className}`} style={vars} data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="pd-tabs" role="tablist" aria-label="Portal screens">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={tab === tb.id}
            className="pd-tab"
            onClick={() => setTab(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="pd-frame" role="tabpanel" aria-label={TABS.find((x) => x.id === tab)?.label}>
        {/* Sidebar (>= 900px) */}
        <aside className="pd-sidebar" aria-hidden="true">
          <div className="pd-logo-row">{brand}</div>
          <div className="pd-pill-row">
            <ShimmerPill>{isClient ? 'Client portal' : 'Firm dashboard'}</ShimmerPill>
          </div>
          <nav className="pd-nav">
            {nav.map((item) => (
              <div key={item.key} className="pd-nav-item" data-active={item.key === active}>
                <Chip tone={item.tone}>{item.icon}</Chip>
                {item.label}
              </div>
            ))}
          </nav>
          <div className="pd-side-foot">
            <span className="pd-avatar">{initials(footName)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="pd-foot-name">{footName}</div>
              <div className="pd-foot-role">{footRole}</div>
            </div>
          </div>
        </aside>

        <div className="pd-main">
          {/* Compact top bar (< 900px) */}
          <div className="pd-topbar" aria-hidden="true">
            <div className="pd-topbar-brand">{brand}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pd-icon-btn">
                <Bell size={15} />
                <span className="pd-dot" />
              </span>
              <span className="pd-avatar pd-avatar-sm">{initials(footName)}</span>
            </div>
          </div>

          {/* Desktop header */}
          <div className="pd-header" aria-hidden="true">
            <span className="pd-search">
              <Search size={14} />
              Search…
            </span>
            <span className="pd-icon-btn">
              <Bell size={15} />
              <span className="pd-dot" />
            </span>
          </div>

          <div className="pd-content">
            {tab === 'dashboard' && <DashboardScreen firstName={ownerFirst} firmName={firmName} />}
            {tab === 'engagements' && (
              <EngagementsScreen
                firmName={firmName}
                ownerName={ownerName}
                state={engagement}
                onChange={setEngagement}
              />
            )}
            {tab === 'invoices' && <InvoicesScreen />}
            {tab === 'organizer' && <OrganizerScreen />}
            {tab === 'client' && <ClientScreen clientFirst={clientFirst} firmName={firmName} />}
          </div>
        </div>
      </div>
    </div>
  );
}
