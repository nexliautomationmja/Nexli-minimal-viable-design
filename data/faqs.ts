export interface FaqItem {
  question: string;
  answer: string;
}

/** Rendered by components/AIAutomations.tsx and emitted as FAQPage schema on /ai-automations. */
export const aiAutomationsFaq: FaqItem[] = [
  {
    question: 'Will my clients think the messages are impersonal?',
    answer:
      "Not at all. Every message is written in your firm's voice with your branding. Clients see your name, your tone, and your personality. Most never realize it's automated — they just appreciate the fast, professional response.",
  },
  {
    question: 'Is this hard to set up?',
    answer:
      'We handle everything. Setup takes less than 48 hours and requires zero technical knowledge from you. We configure your automations, write your message sequences, and connect everything to your existing phone number and calendar.',
  },
  {
    question: 'Is client data secure and compliant?',
    answer:
      'Absolutely. All data is encrypted in transit and at rest. Our platform is built for professional services firms and follows industry best practices for data protection. Your client information never touches third-party servers.',
  },
  {
    question: 'What if I want to change the messaging or turn something off?',
    answer:
      'You have full control. Pause, edit, or customize any automation at any time through your dashboard. Want to tweak the missed-call text? Change a nurture sequence? It takes seconds. And our team is always available to help.',
  },
];
