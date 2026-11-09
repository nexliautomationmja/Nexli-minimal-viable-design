// ---------------------------------------------------------------------------
// Is this a phone? One rule, used in the browser and on the server, so a
// download button and a shared link always agree.
//
// Used to hand out the right See the Math PDF: the phone version to phones,
// the 16:9 slides to everything else (components/math/pdf, app/math/pdf).
//
// Chromium says so outright: navigator.userAgentData.mobile in the browser,
// Sec-CH-UA-Mobile on the server. When it speaks, that is the answer. Safari
// and Firefox don't, so the user agent decides: iPhone or iPod, Android with
// "Mobile" (Android tablets leave it out), Windows Phone, mobile Firefox and
// Opera. iPads report a Mac user agent and get the slides, which read well
// at tablet width anyway.
// ---------------------------------------------------------------------------

const PHONE_UA = /\b(iPhone|iPod)\b|Android.*\bMobile\b|Windows Phone|\bMobile\b.*Firefox|Opera Mini|IEMobile/i;

export function isPhone({ userAgent, mobileHint }: { userAgent: string; mobileHint?: boolean | null }): boolean {
  if (mobileHint === true) return true;
  if (mobileHint === false) return false;
  return PHONE_UA.test(userAgent);
}

/** Sec-CH-UA-Mobile is "?1" or "?0"; anything else is no answer. */
export function mobileHintFromHeader(value: string | null): boolean | null {
  if (value === '?1') return true;
  if (value === '?0') return false;
  return null;
}
