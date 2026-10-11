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
