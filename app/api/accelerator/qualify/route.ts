// ---------------------------------------------------------------------------
// Accelerator qualifier — five questions, no budget question, free guide.
//
// Same service as the advisory qualifier, different config. The fork:
//
//   cleared the bar -> 'agency'    -> /accelerator/next     VSL + calendar
//   did not         -> 'not-a-fit' -> /accelerator/sending  "it is on its way"
//
// BOTH BRANCHES GET THE GUIDE. The fork decides whether they are shown the
// done-for-you pitch, not whether they are helped. That is the difference
// between this funnel and the advisory one, where 'not-a-fit' means a $97
// downsell.
//
// QUALIFIED LEADS REUSE 'agency' ON PURPOSE. It is what makes every booking
// and pre-call reminder workflow apply to them with no new configuration —
// they book the same call, on the same calendar, through the same
// /api/advisory-pricing/booked route. The price of that reuse is that the
// lead row cannot tell the two funnels apart; TAG_ACCELERATOR_LEAD can.
//
// UNQUALIFIED LEADS DO NOT. pathTagOverride swaps 'advisory not a fit' for
// 'accelerator free lead', because the former drives the sequence that
// sells the $97 guide and these people were just given it.
//
// Open to anyone, like the advisory qualifier: this route is what mints the
// session cookie, so there is nothing to check first.
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";
import { recordQualification } from "@/lib/qualification-service";
import { ADVISORY_PRODUCT_NAME, TAG_ADVISORY_INCOMPLETE } from "@/lib/advisory-config";
import {
  ACCELERATOR_FORM_SOURCE,
  ACCELERATOR_NEXT_PATH,
  ACCELERATOR_QUALIFY_PATH,
  ACCELERATOR_SENDING_PATH,
  TAG_ACCELERATOR_FREE,
  TAG_ACCELERATOR_LEAD,
} from "@/lib/accelerator-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return recordQualification(req, {
    leadId: null,
    collectsContact: true,
    formSource: ACCELERATOR_FORM_SOURCE,
    rateLimitKey: "accelerator-qualify",
    ghlSource: `${ADVISORY_PRODUCT_NAME} - Free Qualifier`,
    noteHeading: "Completed the Accelerator qualifier (free)",
    // Its own content_name so the two funnels stay separable in Ads
    // Manager. They fire the same Lead and CompleteRegistration events,
    // and without this there is no way to tell which one earned a
    // conversion.
    contentName: "Accelerator Qualifier",
    qualifiedEventPrefix: "acq",
    webhookUrl: process.env.GHL_ACCELERATOR_QUALIFY_WEBHOOK_URL,
    webhookEnvName: "GHL_ACCELERATOR_QUALIFY_WEBHOOK_URL",
    webhookSource: "accelerator-qualifier",
    // Goes on both branches, and is the only thing that marks this funnel.
    baseTags: [TAG_ACCELERATOR_LEAD],
    // Clears the partial-capture tag, same as the advisory qualifier.
    removeTags: [TAG_ADVISORY_INCOMPLETE],
    qualifiedPath: "agency",
    unqualifiedPath: "not-a-fit",
    // 'agency' inherits FUNNEL_PATH_TAG ('agency pitch') so the booking
    // workflows apply; only the unqualified branch is overridden.
    pathTagOverride: { "not-a-fit": TAG_ACCELERATOR_FREE },
    nextPath: {
      agency: ACCELERATOR_NEXT_PATH,
      "not-a-fit": ACCELERATOR_SENDING_PATH,
    },
    sourcePath: ACCELERATOR_QUALIFY_PATH,
  });
}
