import type { FirmSiteConfig } from '../../lib/firm-sites/types';

/**
 * Sample Firm Foundation site. Fictional firm, used as the reference config
 * and as the /sites/example-firm preview. Copy this file to start a new firm.
 */
export const exampleFirm: FirmSiteConfig = {
  slug: 'example-firm',
  domain: 'ridgelinetax.example',
  firmName: 'Ridgeline Tax & Advisory',
  tagline: 'Proactive tax strategy for owners who want to keep more of what they earn.',
  heroHeadline: 'Tax strategy that works as hard as you do.',
  heroSub:
    'Ridgeline is a CPA firm for business owners, professionals and families in the Front Range who are done with reactive, once-a-year tax filing. We plan ahead, communicate clearly and keep every document in one secure place.',
  colors: {
    primary: '#1f3d2b',
    accent: '#d4a24c',
    background: '#fbfaf7',
    surface: '#ffffff',
    text: '#1a1f1c',
    textMuted: '#5b655f',
    border: '#e4e2dc',
  },
  fonts: {
    heading: "'Fraunces', Georgia, 'Times New Roman', serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
  },
  style: 'solid',
  services: [
    {
      icon: 'user',
      title: 'Individual Tax Preparation',
      description:
        'Accurate, on-time federal and state returns for professionals, investors and retirees, with a review call so you understand every number before we file.',
    },
    {
      icon: 'building',
      title: 'Business Tax',
      description:
        'S-corp, partnership and corporate returns handled by a CPA who knows your business, plus quarterly estimates so there are no April surprises.',
    },
    {
      icon: 'target',
      title: 'Tax Planning',
      description:
        'Year-round strategy sessions covering entity structure, retirement contributions, timing of income and deductions, and the credits most owners miss.',
    },
    {
      icon: 'book',
      title: 'Bookkeeping',
      description:
        'Clean monthly books in QuickBooks Online, reconciled and reviewed, so your financials are always ready for lenders, investors and tax time.',
    },
    {
      icon: 'banknote',
      title: 'Payroll',
      description:
        'Full-service payroll with tax filings, direct deposit and year-end W-2s and 1099s, integrated with your books.',
    },
    {
      icon: 'trending-up',
      title: 'Advisory & CFO Services',
      description:
        'Cash-flow forecasting, KPI dashboards and quarterly strategy meetings for owners who want a financial partner, not just a preparer.',
    },
  ],
  about: {
    heading: 'A firm built around planning, not paperwork.',
    body:
      'Ridgeline was founded in 2011 by Dana Whitfield, CPA, after a decade at a regional firm where clients only heard from their accountant in March. Today our team of six serves more than 400 households and 120 businesses across Colorado. Every client gets a dedicated CPA, a planning calendar and a secure portal, so nothing is lost in an inbox and nothing is left to chance.',
    highlights: [
      'Licensed CPAs on every engagement',
      'Fixed-fee pricing agreed before work starts',
      'Responses within one business day, year-round',
      'Secure client portal for documents, e-signatures and payments',
    ],
  },
  team: [
    {
      name: 'Dana Whitfield, CPA',
      role: 'Founder & Managing Partner',
      bio: 'Twenty years in tax, with a focus on closely held businesses and real estate investors.',
    },
    {
      name: 'Marcus Reyes, CPA',
      role: 'Tax Manager',
      bio: 'Leads business tax and entity planning. Former Big Four senior associate.',
    },
    {
      name: 'Priya Natarajan',
      role: 'Client Accounting Lead',
      bio: 'Runs bookkeeping and payroll so owners always have clean, current numbers.',
    },
  ],
  testimonials: [
    {
      quote:
        'We moved to Ridgeline after three years of surprise tax bills. The first planning meeting found $28,000 in savings we had been leaving on the table every year.',
      name: 'Jordan Ellis',
      detail: 'Owner, Ellis Mechanical',
    },
    {
      quote:
        'Everything happens in the portal. I upload documents from my phone, sign the engagement letter, pay the invoice, and I always know where my return stands.',
      name: 'Samantha Cho',
      detail: 'Physician and rental property owner',
    },
  ],
  stats: [
    { value: '14+', label: 'Years serving Colorado' },
    { value: '500+', label: 'Clients and businesses' },
    { value: '$2.1M', label: 'Client tax savings last year' },
    { value: '1 day', label: 'Typical response time' },
  ],
  bookingUrl: 'https://cal.com/ridgeline-tax/consultation',
  portalUrl: 'https://portal.nexli.net/portal',
  contact: {
    phone: '(720) 555-0148',
    email: 'hello@ridgelinetax.example',
    address: '2120 S Broadway, Suite 210, Denver, CO 80210',
    hours: 'Mon to Fri, 8:30am to 5:00pm MT',
  },
  seo: {
    title: 'Ridgeline Tax & Advisory | CPA Firm in Denver, CO',
    description:
      'Denver CPA firm offering proactive tax planning, business and individual tax preparation, bookkeeping, payroll and advisory services with a secure client portal.',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/ridgeline-tax-advisory',
    google: 'https://g.page/ridgeline-tax-advisory',
  },
};
