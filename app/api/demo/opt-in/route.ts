// ---------------------------------------------------------------------------
// Demo funnel, page 1 → the only place that funnel collects contact details.
// The work lives in lib/optin-service.ts, shared with the advisory funnel.
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";
import { handleOptIn } from "@/lib/optin-service";
import {
  DEMO_FORM_SOURCE,
  DEMO_OPT_IN_PATH,
  DEMO_PATH,
  TAG_DEMO_OPT_IN,
} from "@/lib/demo-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handleOptIn(req, {
    rateLimitKey: "demo-optin",
    formSource: DEMO_FORM_SOURCE,
    ghlSource: "Nexli Demo - Opt In",
    tag: TAG_DEMO_OPT_IN,
    contentName: "Nexli Demo - Guest Access",
    webhookUrl: process.env.GHL_DEMO_OPTIN_WEBHOOK_URL,
    webhookEnvName: "GHL_DEMO_OPTIN_WEBHOOK_URL",
    optInPath: DEMO_OPT_IN_PATH,
    nextPath: DEMO_PATH,
    unavailableMessage:
      "Guest access is temporarily unavailable. Please try again in a moment.",
  });
}
