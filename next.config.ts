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

      { source: "/advisory-pricing/offer", destination: "/advisory-pricing/BOBA", permanent: true },
      { source: "/advisory-pricing/thank-you", destination: "/advisory-pricing/BOBA-thank-you", permanent: true },

      // ── Retired funnels ──────────────────────────────────────────────
      // The demo funnel, the /vslfunnel* landers, /funnel, /thank-you and
      // /free-guide were deleted when the advisory funnel became the only
      // one. Every one of them was live and indexed, so they redirect to
      // the advisory VSL rather than 404 — old ad destinations, backlinks
      // and anything already crawled still land somewhere that sells.
      { source: "/demo", destination: "/advisory-pricing", permanent: true },
      { source: "/demo/:path*", destination: "/advisory-pricing", permanent: true },
      { source: "/demo-opt-in", destination: "/advisory-pricing", permanent: true },
      { source: "/funnel", destination: "/advisory-pricing", permanent: true },
      { source: "/free-guide", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel-admin", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel-advisory", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel-betterclients", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel-offer", destination: "/advisory-pricing", permanent: true },
      { source: "/vslfunnel-techstack", destination: "/advisory-pricing", permanent: true },
      // /thank-you was the generic post-form page. It goes to the funnel's
      // own thank-you, which is the only one left.
      { source: "/thank-you", destination: "/advisory-pricing/BOBA-thank-you", permanent: true },
      // These two pointed at the demo funnel, which no longer exists.
      { source: "/roadmap", destination: "/advisory-pricing", permanent: true },
      { source: "/roadmap/thank-you", destination: "/advisory-pricing", permanent: true },
      { source: "/foundation", destination: "/advisory-pricing", permanent: true },
      { source: "/foundation/start", destination: "/advisory-pricing", permanent: true },
      { source: "/foundation/preview/:token*", destination: "/advisory-pricing", permanent: true },
      { source: "/foundation/thank-you", destination: "/advisory-pricing", permanent: true },
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
