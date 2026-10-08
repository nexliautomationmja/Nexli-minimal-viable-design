// ---------------------------------------------------------------------------
// Server-only half of the delivery check.
//
// Separate from lib/advisory-config.ts because that module is imported by
// client components (they read the product name and the price), and a
// top-level `node:path` import there would break the client bundle.
//
// Only the download route uses this now. Delivery is by email, so nothing
// on any page depends on whether the file is present.
// ---------------------------------------------------------------------------
import { join } from 'node:path';
import { ADVISORY_PDF_RELATIVE_PATH } from './advisory-config';

/** Absolute path to the PDF in this deployment. */
export function advisoryPdfPath(): string {
  return join(process.cwd(), ADVISORY_PDF_RELATIVE_PATH);
}
