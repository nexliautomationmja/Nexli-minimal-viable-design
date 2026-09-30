/**
 * Firm-site outbound link attributes.
 *
 * Client sites point their two CTAs (bookingUrl / portalUrl) at real external
 * destinations, so those anchors need target="_blank" + rel="noopener".
 *
 * The Evergreen demo firm is the exception: it is a showcase of *someone
 * else's* firm, so its CTAs must not open Nexli's own calendar or portal
 * login. Its config points them at "#top" instead, and an in-page anchor must
 * NOT carry target="_blank" — that would open a second tab onto the same page.
 *
 * Spread the result onto the anchor and both cases are handled from the config
 * alone, with no per-component branching.
 */
export function linkProps(href: string): { target?: '_blank'; rel?: string } {
  return href.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' };
}
