import type { Guide } from './types';
import howCpaFirmsGetAdvisoryClients from './how-cpa-firms-get-advisory-clients';
import howToScaleACpaFirmWithoutHiring from './how-to-scale-a-cpa-firm-without-hiring';
import bestCpaFirmMarketingAgencies from './best-cpa-firm-marketing-agencies';
import cpaFirmLeadGeneration from './cpa-firm-lead-generation';
import whatIsTheDigitalRainmakerSystem from './what-is-the-digital-rainmaker-system';
import howMuchShouldACpaFirmSpendOnMarketing from './how-much-should-a-cpa-firm-spend-on-marketing';
import cpaFirmGrowthStrategy from './cpa-firm-growth-strategy';

export type { Guide, GuideCategory, GuideFaq, GuideSection, GuideStat, GuideTable, GuideCta } from './types';

/** Ordered by the intent we most want to be cited for. */
export const guides: Guide[] = [
  howCpaFirmsGetAdvisoryClients,
  cpaFirmGrowthStrategy,
  bestCpaFirmMarketingAgencies,
  cpaFirmLeadGeneration,
  howToScaleACpaFirmWithoutHiring,
  howMuchShouldACpaFirmSpendOnMarketing,
  whatIsTheDigitalRainmakerSystem,
];

export const getGuideBySlug = (slug: string): Guide | undefined =>
  guides.find((g) => g.slug === slug);

export const DEFAULT_GUIDE_CTA = {
  heading: 'See how established CPA firms fill their calendar with advisory clients',
  body: 'Watch the short presentation on the Digital Rainmaker System, the two guarantees, and who it is built for. Then decide whether a strategy call makes sense.',
  href: '/vslfunnel-advisory',
  label: 'Watch the presentation',
};
