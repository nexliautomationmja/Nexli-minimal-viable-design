/**
 * One set of contact rules for every place that collects a lead.
 *
 * These were written twice — once in components/demo/OptInForm.tsx as the
 * client mirror, once in lib/optin-service.ts as the server check — and the
 * advisory qualifier was about to become a third copy. A rule that exists in
 * three places is a rule that will disagree with itself.
 *
 * Server-safe: no React, no browser globals.
 */

/** Deliberately loose. Real validation is whether the address receives mail. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_NAME = 100;
export const MAX_FIRM = 200;
/** North American numbers after stripping punctuation. */
export const MIN_PHONE_DIGITS = 10;

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
}

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

/** Trim and cap, so an over-long field is rejected rather than truncated silently. */
export const trimTo = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export function digitsOf(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * A phone in E.164 (+15551234567), or '' when it cannot be known.
 *
 * Phones are stored exactly as the visitor typed them — optin-service only
 * checks there are ten digits, so the column holds '(555) 123-4567' and
 * '555.123.4567' alike. Cal.com's phone field rejects anything that is not
 * E.164, and rejects it silently: the prefill simply does not appear.
 *
 * Assumes +1 for a bare ten-digit number, which this funnel can do because
 * the qualifier asks whether the firm is US-based and routes anyone who is
 * not away before the calendar.
 *
 * Returns '' rather than guessing on anything else. A blank field the
 * visitor fills in themselves beats a wrong number they do not notice,
 * because that number is what the SMS reminders go to.
 */
export function toE164(phone: string): string {
  const raw = (phone || '').trim();
  if (!raw) return '';

  const digits = digitsOf(raw);

  // Typed with an international prefix — trust it rather than re-deriving.
  if (raw.startsWith('+')) return digits.length >= 8 ? `+${digits}` : '';

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;

  return '';
}

/**
 * Returns a per-field error map; empty means valid. Messages are written to
 * be shown to the visitor, so they say what to do rather than what is wrong.
 */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!input.firstName.trim()) errors.firstName = 'Enter your first name.';
  else if (input.firstName.trim().length > MAX_NAME) errors.firstName = 'That name is too long.';

  if (!input.lastName.trim()) errors.lastName = 'Enter your last name.';
  else if (input.lastName.trim().length > MAX_NAME) errors.lastName = 'That name is too long.';

  if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid work email.';

  if (digitsOf(input.phone).length < MIN_PHONE_DIGITS) {
    errors.phone = 'Enter a mobile number with at least 10 digits.';
  }

  if (!input.firmName.trim()) errors.firmName = 'Enter your firm name.';
  else if (input.firmName.trim().length > MAX_FIRM) errors.firmName = 'Firm name is too long.';

  return errors;
}

export const isValidContact = (input: ContactInput): boolean =>
  Object.keys(validateContact(input)).length === 0;
