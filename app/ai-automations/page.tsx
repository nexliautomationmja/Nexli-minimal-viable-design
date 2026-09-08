import type { Metadata } from 'next';
import AIAutomations from '../../components/AIAutomations';
import JsonLd from '../../components/JsonLd';
import { aiAutomationsFaq } from '../../data/faqs';
import { breadcrumbSchema, faqSchema } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'AI Automations | Missed-Call Text-Back & Lead Nurture for CPAs | Nexli',
  description: 'Never miss an inquiry again. AI-powered missed-call text-back, automated follow-up sequences, and smart booking for CPAs and accounting firms.',
  alternates: { canonical: '/ai-automations' },
};

export default function AIAutomationsPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(aiAutomationsFaq),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'AI Automations', path: '/ai-automations' },
          ]),
        ]}
      />
      <AIAutomations />
    </>
  );
}
