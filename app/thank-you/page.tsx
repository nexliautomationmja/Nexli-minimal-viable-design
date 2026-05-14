import type { Metadata } from 'next';
import ThankYouClient from './thank-you-client';

export const metadata: Metadata = {
  title: 'Thank You | Your Strategy Session is Booked | Nexli',
  description: 'Your strategy session has been booked. We look forward to speaking with you.',
  robots: 'noindex, nofollow',
};

export default function ThankYouPage() {
  return <ThankYouClient />;
}
