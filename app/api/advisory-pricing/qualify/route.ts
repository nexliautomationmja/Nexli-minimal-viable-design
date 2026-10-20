// ---------------------------------------------------------------------------
// Advisory funnel qualifier — and, since the opt-in page is gone, the lead
// capture too. This is the first point at which we know who anyone is.
//
// Four questions, then contact details, then the budget question. The fork:
//
//   qualified -> 'agency'    -> /advisory-pricing/call   (book the call)
//   otherwise -> 'not-a-fit' -> /advisory-pricing/BOBA  ($97 downsell)
//
// Open to anyone: there is no cookie to check, because this route is what
// mints it. recordQualification upserts on email so a visitor who abandons
// and comes back does not leave a second row behind.
//
// 'not-a-fit' rather than 'web': this firm is not being pitched a website,
// and tagging them that way would drop them into the wrong nurture.
//
// No buyer tag is ever applied here — most firms reaching this have paid
// nothing, and marking them buyers would drop them out of every
// pre-purchase sequence, all of which gate on that tag being absent.
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";
import { recordQualification } from "@/lib/qualification-service";
import {
  ADVISORY_CALL_PATH,
  ADVISORY_FORM_SOURCE,
  ADVISORY_OFFER_PATH,
  ADVISORY_PATH,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_QUALIFY_PATH,
  TAG_ADVISORY_INCOMPLETE,
} from "@/lib/advisory-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return recordQualification(req, {
    // No cookie to resolve — the contact step is the identity.
    leadId: null,
    collectsContact: true,
    formSource: ADVISORY_FORM_SOURCE,
    rateLimitKey: "advisory-qualify",
    ghlSource: `${ADVISORY_PRODUCT_NAME} - Qualifier`,
    noteHeading: "Completed the advisory qualifier",
    contentName: "Advisory Qualifier",
    qualifiedEventPrefix: "aql",
    webhookUrl: process.env.GHL_ADVISORY_QUALIFY_WEBHOOK_URL,
    webhookEnvName: "GHL_ADVISORY_QUALIFY_WEBHOOK_URL",
    webhookSource: "advisory-qualifier",
    // No opt-in tag. There is no "opted in and nothing since" stage any
    // more — the qualifier is the first thing that happens to anyone, and
    // it always ends in 'advisory qualified' or 'advisory not a fit'.
    // Adding the opt-in tag here would recreate the two-stages-at-once
    // problem it was removed to fix.
    baseTags: [],
    // Finishing clears the incomplete tag that /partial applied at the
    // contact step. The tag has to mean STILL unfinished, or the
    // abandonment sequence chases firms that went on to book.
    removeTags: [TAG_ADVISORY_INCOMPLETE],
    qualifiedPath: "agency",
    unqualifiedPath: "not-a-fit",
    nextPath: { agency: ADVISORY_CALL_PATH, "not-a-fit": ADVISORY_OFFER_PATH },
    sourcePath: ADVISORY_QUALIFY_PATH,
  });
}
