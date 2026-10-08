// ---------------------------------------------------------------------------
// Advisory funnel qualifier. Gated on the opt-in cookie, not a purchase.
//
// This is the fork in the funnel:
//
//   qualified -> 'agency'    -> /advisory-pricing/call   (book the call)
//   otherwise -> 'not-a-fit' -> /advisory-pricing/offer  ($297 downsell)
//
// 'not-a-fit' rather than 'web': this firm is not being pitched a website,
// and tagging them that way would drop them into the wrong nurture sequence.
//
// Tagging: 'advisory opt-in' comes OFF here, it does not go on. Stage tags
// are exclusive — "advisory opt-in" means opted in and done nothing since,
// which stops being true the moment this route runs. What replaces it is the
// outcome tag, 'advisory qualified' or 'advisory not a fit'.
//
// The buyer tag is never applied here either: most firms reaching this route
// have paid nothing, and marking them buyers would both misreport them as
// customers and drop them out of the pre-purchase sequences.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { readDemoLead } from "@/lib/demo-session";
import { recordQualification } from "@/lib/qualification-service";
import {
  ADVISORY_CALL_PATH,
  ADVISORY_OFFER_PATH,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_QUALIFY_PATH,
  TAG_ADVISORY_OPT_IN,
} from "@/lib/advisory-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const leadId = await readDemoLead();
  if (!leadId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return recordQualification(req, {
    leadId,
    rateLimitKey: "advisory-qualify",
    ghlSource: `${ADVISORY_PRODUCT_NAME} - Qualifier`,
    noteHeading: "Completed the advisory qualifier",
    contentName: "Advisory Qualifier",
    qualifiedEventPrefix: "aql",
    webhookUrl: process.env.GHL_ADVISORY_QUALIFY_WEBHOOK_URL,
    webhookEnvName: "GHL_ADVISORY_QUALIFY_WEBHOOK_URL",
    webhookSource: "advisory-qualifier",
    baseTags: [],
    removeTags: [TAG_ADVISORY_OPT_IN],
    qualifiedPath: "agency",
    unqualifiedPath: "not-a-fit",
    nextPath: { agency: ADVISORY_CALL_PATH, "not-a-fit": ADVISORY_OFFER_PATH },
    sourcePath: ADVISORY_QUALIFY_PATH,
  });
}
