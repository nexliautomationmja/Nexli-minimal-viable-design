// ---------------------------------------------------------------------------
// Advisory funnel, page 1. Same machinery as the demo funnel's opt-in; only
// the tagging and the destination differ.
//
// Sends the visitor to the VSL, not to checkout. The opt-in's whole promise is
// the video; the $297 is now the downsell the qualifier routes to, so nothing
// here should point at ADVISORY_OFFER_PATH.
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";
import { handleOptIn } from "@/lib/optin-service";
import {
  ADVISORY_FORM_SOURCE,
  ADVISORY_PATH,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_VSL_PATH,
  TAG_ADVISORY_OPT_IN,
} from "@/lib/advisory-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handleOptIn(req, {
    rateLimitKey: "advisory-optin",
    formSource: ADVISORY_FORM_SOURCE,
    ghlSource: `${ADVISORY_PRODUCT_NAME} - Opt In`,
    tag: TAG_ADVISORY_OPT_IN,
    contentName: `${ADVISORY_PRODUCT_NAME} - Opt In`,
    webhookUrl: process.env.GHL_ADVISORY_OPTIN_WEBHOOK_URL,
    webhookEnvName: "GHL_ADVISORY_OPTIN_WEBHOOK_URL",
    optInPath: ADVISORY_PATH,
    nextPath: ADVISORY_VSL_PATH,
    unavailableMessage:
      "We could not open the training just now. Please try again in a moment.",
  });
}
