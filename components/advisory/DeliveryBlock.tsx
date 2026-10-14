// ---------------------------------------------------------------------------
// What the buyer paid for, and where it is.
//
// Delivery is by email only: the GoHighLevel purchase workflow attaches the
// PDF. There is deliberately no download button here — the card it needed ran
// 293px on mobile and pushed the agency CTA below the fold, and this notice
// does the same job in about a third of the height.
//
// Rendered on the thank-you page AND at the top of /next-steps. That shared
// use is the point: a firm told it is not a fit for the engine must still see
// the thing it bought before it sees the word "no".
//
// Because email is now the only channel, the failure case has to be on the
// page. A buyer who paid two minutes ago and sees nothing in their inbox
// needs to know what to do before they reach for a refund.
//
// Deliberately not rimmed. It is the only emerald element in the funnel and
// it sits on a page that already has a shimmering showpiece — two of those
// on one screen means the eye picks neither.
// ---------------------------------------------------------------------------
import type { CSSProperties } from 'react';
import { Mail } from 'lucide-react';
import { ADVISORY_PRODUCT_NAME } from '@/lib/advisory-config';

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export default function DeliveryBlock({ email }: { email?: string | null }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-4 sm:p-5"
      style={{
        background: 'rgba(16,185,129,0.06)',
        borderColor: 'rgba(16,185,129,0.25)',
      }}
    >
      <span
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#34d399',
        }}
      >
        <Mail size={16} aria-hidden="true" />
      </span>

      <div>
        <p className="text-sm sm:text-base font-bold text-white" style={OUTFIT}>
          Your {ADVISORY_PRODUCT_NAME} is on its way
          {email ? (
            <>
              {' '}to <span className="text-emerald-300">{email}</span>
            </>
          ) : null}
          .
        </p>
        <p
          className="mt-1 text-xs sm:text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          It lands in the next two minutes. Nothing after that? Check spam, then email
          mail@nexli.net and we will send it straight over.
        </p>
      </div>
    </div>
  );
}
