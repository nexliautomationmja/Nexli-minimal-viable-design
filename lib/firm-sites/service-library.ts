/**
 * Canonical service copy for Firm Foundation websites, keyed by the ids the
 * intake form collects. Ported from dashboard/src/lib/firm-sites/service-library.ts
 * and extended with a keyword matcher so free-text service names (from a
 * prospect's current website) can be mapped onto the library.
 */
import type { FirmSiteConfig } from "./types";

export type IntakeServiceId =
  | "individual-tax"
  | "business-tax"
  | "bookkeeping"
  | "tax-planning"
  | "payroll"
  | "cfo"
  | "audit"
  | "estate"
  | "irs-resolution"
  | "advisory";

export interface ServiceLibraryEntry {
  title: string;
  description: string;
  icon: string;
  /** Lowercase keywords that map free text onto this entry. */
  keywords: string[];
}

export const SERVICE_LIBRARY: Record<IntakeServiceId, ServiceLibraryEntry> = {
  "individual-tax": {
    title: "Individual Tax Preparation",
    description:
      "Accurate, on-time federal and state returns for individuals and families, with every credit and deduction you are entitled to reviewed by a CPA.",
    icon: "user",
    keywords: ["individual tax", "personal tax", "1040", "tax preparation", "tax prep", "tax return"],
  },
  "business-tax": {
    title: "Business Tax Returns",
    description:
      "Partnership, S corporation, C corporation and sole proprietor filings prepared with an eye toward reducing your liability and keeping you compliant year round.",
    icon: "building",
    keywords: ["business tax", "corporate tax", "partnership", "s corp", "s-corp", "entity", "1120", "1065"],
  },
  bookkeeping: {
    title: "Bookkeeping & Accounting",
    description:
      "Monthly reconciliations and clean, reliable financial statements so you always know where the business stands and tax season holds no surprises.",
    icon: "book",
    keywords: ["bookkeeping", "accounting", "quickbooks", "financial statement", "reconciliation", "outsourced accounting"],
  },
  "tax-planning": {
    title: "Tax Planning & Strategy",
    description:
      "Proactive, year-round planning that structures your income, entities and investments to lower what you owe before the year closes.",
    icon: "target",
    keywords: ["tax planning", "tax strategy", "tax saving", "tax reduction", "tax minimization"],
  },
  payroll: {
    title: "Payroll Services",
    description:
      "Reliable payroll processing, tax deposits and quarterly filings handled for you, so your team is paid correctly and on schedule every time.",
    icon: "banknote",
    keywords: ["payroll"],
  },
  cfo: {
    title: "Fractional CFO & Advisory",
    description:
      "Cash-flow forecasting, budgeting and financial guidance from an experienced CPA who understands where you want to take the business.",
    icon: "trending-up",
    keywords: ["cfo", "controller", "forecasting", "budgeting", "cash flow"],
  },
  audit: {
    title: "Audit, Review & Assurance",
    description:
      "Independent audits, reviews and compilations that give lenders, boards and investors confidence in your financial statements.",
    icon: "shield-check",
    keywords: ["audit", "assurance", "attest", "review and compilation", "compilation"],
  },
  estate: {
    title: "Estate & Trust Planning",
    description:
      "Estate, gift and trust tax planning and filings that protect what you have built and pass it on the way you intend.",
    icon: "landmark",
    keywords: ["estate", "trust", "gift tax", "succession", "wealth transfer"],
  },
  "irs-resolution": {
    title: "IRS Representation",
    description:
      "Notices, audits and back taxes handled by a CPA who deals with the IRS and state agencies on your behalf.",
    icon: "scale",
    keywords: ["irs", "tax resolution", "tax problem", "back taxes", "representation", "notice"],
  },
  advisory: {
    title: "Business Advisory",
    description:
      "Practical guidance on entity structure, growth decisions and transactions from an advisor who knows your numbers.",
    icon: "briefcase",
    keywords: ["advisory", "consulting", "business consulting", "startup", "mergers", "acquisition", "valuation"],
  },
};

export const INTAKE_SERVICE_IDS = Object.keys(SERVICE_LIBRARY) as IntakeServiceId[];

export const DEFAULT_SERVICE_IDS: IntakeServiceId[] = [
  "individual-tax",
  "business-tax",
  "tax-planning",
  "bookkeeping",
];

export function isIntakeServiceId(id: unknown): id is IntakeServiceId {
  return typeof id === "string" && id in SERVICE_LIBRARY;
}

function toService(id: IntakeServiceId): FirmSiteConfig["services"][number] {
  const entry = SERVICE_LIBRARY[id];
  return { title: entry.title, description: entry.description, icon: entry.icon };
}

/** Map a free-text service name ("Tax Planning for Dentists") onto a library id, or null. */
export function matchServiceId(text: string): IntakeServiceId | null {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return null;
  if (isIntakeServiceId(t.trim())) return t.trim() as IntakeServiceId;
  for (const id of INTAKE_SERVICE_IDS) {
    if (SERVICE_LIBRARY[id].keywords.some((k) => t.includes(k))) return id;
  }
  return null;
}

/**
 * Map intake ids or free-text service names to site services in the order
 * given. Unknown entries are ignored and duplicates collapsed; an empty or
 * missing list falls back to DEFAULT_SERVICE_IDS.
 */
export function servicesFromIntake(ids?: string[] | null): FirmSiteConfig["services"] {
  const seen = new Set<IntakeServiceId>();
  const picked: IntakeServiceId[] = [];
  for (const raw of ids ?? []) {
    const id = isIntakeServiceId(raw) ? raw : matchServiceId(String(raw ?? ""));
    if (id && !seen.has(id)) {
      seen.add(id);
      picked.push(id);
    }
  }
  const list = picked.length ? picked : DEFAULT_SERVICE_IDS;
  return list.map(toService);
}

/** Icon for a free-text service title, falling back to a neutral icon. */
export function iconForServiceTitle(title: string): string {
  const id = matchServiceId(title);
  return id ? SERVICE_LIBRARY[id].icon : "check-circle";
}
