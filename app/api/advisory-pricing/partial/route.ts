// ---------------------------------------------------------------------------
// Banks the contact step before the last question is answered.
//
// NO LONGER CALLED by the qualifier as of 2026-11-11: the budget question
// was removed, contact became the last step, and app/_funnel/qualify-step
// stopped passing partialEndpoint. Kept so a visitor still on the old page
// bundle at deploy time is not met with a 404. Everything about why it
// existed is in lib/partial-lead-service.
//
// It was called by QualifyFlow the moment someone submitted their details
// at step 5 of 6.
//
// Fire and forget from the browser: the visitor is already on the budget
// question. This route never blocks a step and never shows an error.
// ---------------------------------------------------------------------------
import { NextRequest } from "next/server";
import { ADVISORY_PARTIAL_CONFIG, recordPartialLead } from "@/lib/partial-lead-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return recordPartialLead(req, ADVISORY_PARTIAL_CONFIG);
}
