'use client';

// ---------------------------------------------------------------------------
// Nexli's site-wide Organization and WebSite JSON-LD — on Nexli's pages only.
//
// Client firm websites are served by this app under the root layout, so
// until now each one carried Nexli's Organization schema (Nexli's @id, name,
// logo and social profiles) on the firm's own domain. To a search engine or
// an AI assistant that reads as the firm's website BEING Nexli — the likeliest
// way ChatGPT came to show a client firm's homepage as Nexli's picture.
//
// It is a client component that builds the schema itself, rather than a
// wrapper around server-rendered children, on purpose: children passed into
// a client component are serialised into the page's RSC payload even when
// the wrapper renders nothing, which left Nexli's @id in a firm site's HTML.
// Built here, nothing about Nexli is sent to a firm's page at all.
// ---------------------------------------------------------------------------

import JsonLd from './JsonLd';
import { organizationSchema, websiteSchema } from '../lib/schema';
import { useIsFirmSite } from '../lib/use-is-firm-site';

export default function NexliEntitySchema() {
  if (useIsFirmSite()) return null;
  return <JsonLd data={[organizationSchema(), websiteSchema()]} />;
}
