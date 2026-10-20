// ---------------------------------------------------------------------------
// Banks the contact step before the last question is answered.
//
// Called by QualifyFlow the moment someone submits their details at step 5
// of 6. Everything that makes this necessary is in lib/partial-lead-service.
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
