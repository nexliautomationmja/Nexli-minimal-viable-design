import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // The Book of Business Accelerator PDF lives outside public/ on purpose —
  // it is the whole $297 product and anything in public/ is a guessable URL.
  // Files outside public/ are not bundled into the serverless function by
  // default, so without this the gated download route 404s in production
  // while working perfectly on localhost.
  outputFileTracingIncludes: {
    "/api/advisory-pricing/download": ["./assets/**"],
  },
  async redirects() {
    return [
      // /offer and /thank-you became /BOBA and /BOBA-thank-you. These two
      // point OLD -> NEW, which is the safe direction: anything already in
      // the wild (Stripe receipts, GHL emails, ad destinations) still lands
      // on the live page. Never add a redirect pointing the other way — a
      // retired funnel once 301'd its own thank-you page to a signup form
      // and sent every buyer to re-opt-in instead of their download.
      // Confirmation page A is deleted; B is the only one. Anything still
      // pointing at A — a GHL workflow, an old email, a bookmark — lands on
      // B instead of a 404.
      { source: "/booking-confirmed", destination: "/booking-confirmed-b", permanent: true },

      // The VSL moved to /agency on 4 Nov 2026. This is in live ad
      // destinations and in sent email, so it 301s rather than 404s. ONLY
      // the bare path: the funnel's inner steps still live under
      // /advisory-pricing/ and must not be swept up by a :path* rule.
      { source: "/advisory-pricing", destination: "/agency", permanent: true },
      // The three funnel steps moved under their own angle on 4 Nov 2026.
      // These are live resume links in already-sent email, so they 301 to
      // the agency angle. Next forwards the query string, which is what
      // keeps an old ?angle=systems link attributed to Systems rather than
      // silently re-badged — see the note in app/_funnel/qualify-step.
      { source: "/advisory-pricing/qualify", destination: "/agency/qualify", permanent: true },
      { source: "/advisory-pricing/call", destination: "/agency/call", permanent: true },
      { source: "/advisory-pricing/next-steps", destination: "/agency/next-steps", permanent: true },
      { source: "/advisory-pricing/offer", destination: "/advisory-pricing/BOBA", permanent: true },
      { source: "/advisory-pricing/thank-you", destination: "/advisory-pricing/BOBA-thank-you", permanent: true },

      // ── Retired funnels ──────────────────────────────────────────────
      // The demo funnel, the /vslfunnel* landers, /funnel, /thank-you and
      // /free-guide were deleted when the advisory funnel became the only
      // one. Every one of them was live and indexed, so they redirect to
      // the advisory VSL rather than 404 — old ad destinations, backlinks
      // and anything already crawled still land somewhere that sells.
      { source: "/demo", destination: "/agency", permanent: true },
      { source: "/demo/:path*", destination: "/agency", permanent: true },
      { source: "/demo-opt-in", destination: "/agency", permanent: true },
      { source: "/funnel", destination: "/agency", permanent: true },
      { source: "/free-guide", destination: "/agency", permanent: true },
      { source: "/vslfunnel", destination: "/agency", permanent: true },
      { source: "/vslfunnel-admin", destination: "/agency", permanent: true },
      { source: "/vslfunnel-advisory", destination: "/agency", permanent: true },
      { source: "/vslfunnel-betterclients", destination: "/agency", permanent: true },
      { source: "/vslfunnel-offer", destination: "/agency", permanent: true },
      { source: "/vslfunnel-techstack", destination: "/agency", permanent: true },
      // /thank-you was the generic post-form page. It goes to the funnel's
      // own thank-you, which is the only one left.
      { source: "/thank-you", destination: "/advisory-pricing/BOBA-thank-you", permanent: true },
      // These two pointed at the demo funnel, which no longer exists.
      { source: "/roadmap", destination: "/agency", permanent: true },
      { source: "/roadmap/thank-you", destination: "/agency", permanent: true },
      { source: "/foundation", destination: "/agency", permanent: true },
      { source: "/foundation/start", destination: "/agency", permanent: true },
      { source: "/foundation/preview/:token*", destination: "/agency", permanent: true },
      { source: "/foundation/thank-you", destination: "/agency", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://app.cal.com https://portal.nexli.net https://www.gstatic.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://app.cal.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: data: https://pub-30ba0dacbf5d436998d690d6fc971433.r2.dev https://*.mux.com https://*.edgemv.mux.com",
              "connect-src 'self' https://openrouter.ai https://api.elevenlabs.io https://www.google-analytics.com https://www.facebook.com https://*.facebook.com https://connect.facebook.net https://*.facebook.net https://graph.facebook.com https://*.on.aws https://*.run.app https://services.leadconnectorhq.com https://app.cal.com https://portal.nexli.net https://va.vercel-scripts.com https://inferred.litix.io https://*.mux.com https://*.edgemv.mux.com",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://app.cal.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
