// ---------------------------------------------------------------------------
// Demo funnel page 3. Gated on the opt-in cookie alone.
//
//   qualified -> 'agency' -> /demo/call   (booking, pitched on the call)
//   otherwise -> 'web'    -> /demo/offer  (self-serve website + portal)
//
// The work lives in lib/qualification-service.ts, shared with the advisory
// funnel. This config reproduces the previous behaviour exactly.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { readDemoLead } from "@/lib/demo-session";
import { recordQualification } from "@/lib/qualification-service";
import {
  DEMO_CALL_PATH,
  DEMO_OFFER_PATH,
  DEMO_QUALIFY_PATH,
  TAG_DEMO_OPT_IN,
} from "@/lib/demo-config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const leadId = await readDemoLead();
  if (!leadId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return recordQualification(req, {
    leadId,
    rateLimitKey: "demo-qualify",
    ghlSource: "Nexli Demo - Qualifier",
    noteHeading: "Completed the demo qualifier",
    contentName: "Demo Qualifier",
    qualifiedEventPrefix: "dql",
    webhookUrl: process.env.GHL_DEMO_QUALIFY_WEBHOOK_URL,
    webhookEnvName: "GHL_DEMO_QUALIFY_WEBHOOK_URL",
    webhookSource: "demo-qualifier",
    baseTags: [TAG_DEMO_OPT_IN],
    qualifiedPath: "agency",
    unqualifiedPath: "web",
    nextPath: { agency: DEMO_CALL_PATH, web: DEMO_OFFER_PATH },
    sourcePath: DEMO_QUALIFY_PATH,
  });
}
