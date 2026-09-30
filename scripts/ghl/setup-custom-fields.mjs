#!/usr/bin/env node
/**
 * Create (or find) the eight Nexli contact custom fields in GoHighLevel and
 * print the GHL_CUSTOM_FIELD_IDS line to paste into .env.local / Vercel.
 *
 *   node scripts/ghl/setup-custom-fields.mjs [--env .env.local]
 *
 * Idempotent: a field whose fieldKey OR name already matches (case
 * insensitively) is reused, never duplicated.
 *
 * This script is an OPTIMISATION, not a requirement. lib/ghl.ts falls back to
 * sending field *keys* when GHL_CUSTOM_FIELD_IDS is unset, and it always
 * writes a note on the contact containing every answer — so the data reaches
 * GoHighLevel either way. Running this just makes the answers land in proper,
 * filterable custom fields.
 *
 * Auth is a GoHighLevel Private Integration token (GHL_API_KEY, starts
 * `pit-`) plus GHL_LOCATION_ID. Header shape matches nexli-portal's
 * src/lib/ghl-client.ts, which is known to work against this account.
 */
import { resolve } from 'node:path';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

/** The eight fields the funnel writes. Order is the order they are printed. */
const FIELDS = [
  { key: 'nexli_us_based', name: 'US Based', placeholder: 'Yes / No' },
  { key: 'nexli_decision_role', name: 'Decision Role', placeholder: "The contact's authority to buy" },
  { key: 'nexli_primary_goal', name: 'Primary Goal', placeholder: 'What they are trying to fix' },
  { key: 'nexli_problem_duration', name: 'Problem Duration', placeholder: 'How long it has been a problem' },
  { key: 'nexli_annual_revenue', name: 'Annual Revenue', placeholder: "The firm's revenue band" },
  { key: 'nexli_tax_savings', name: 'Biggest Tax Saving', placeholder: 'Most ever saved for one client' },
  { key: 'nexli_lead_score', name: 'Lead Score', placeholder: 'qualified / raw / disqualified' },
  { key: 'nexli_funnel_path', name: 'Funnel Path', placeholder: 'agency / web' },
];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let envPath = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env') {
      envPath = argv[++i];
      if (!envPath) fail('--env needs a path, e.g. --env .env.local');
    } else if (a.startsWith('--env=')) {
      envPath = a.slice('--env='.length);
    } else if (a === '-h' || a === '--help') {
      console.log(
        [
          'Usage: node scripts/ghl/setup-custom-fields.mjs [--env <path>]',
          '',
          'Creates the eight Nexli qualifier custom fields on the GoHighLevel',
          'location and prints the GHL_CUSTOM_FIELD_IDS env line.',
          '',
          'Environment:',
          '  GHL_API_KEY      Private Integration token (starts "pit-")',
          '  GHL_LOCATION_ID  the sub-account / location id',
        ].join('\n'),
      );
      process.exit(0);
    } else {
      fail(`unknown argument "${a}" (usage: node scripts/ghl/setup-custom-fields.mjs [--env <path>])`);
    }
  }
  return { envPath };
}

function loadEnv(envPath) {
  if (!envPath) return;
  const full = resolve(process.cwd(), envPath);
  try {
    process.loadEnvFile(full);
  } catch (err) {
    fail(`could not load env file ${full}: ${err.message}`);
  }
}

function requireCredentials() {
  const apiKey = (process.env.GHL_API_KEY || '').trim();
  const locationId = (process.env.GHL_LOCATION_ID || '').trim();

  if (!apiKey) {
    fail(
      [
        'GHL_API_KEY is not set.',
        '',
        "GoHighLevel's v2 API needs a Private Integration token, NOT a classic",
        'API key (the long JWT under Settings > Business Profile). Create one at',
        '  Settings > Private Integrations > Create new integration',
        'with write scopes for contacts, tags and notes. The token starts "pit-".',
        '',
        'Then re-run with it in the environment, or point at a file:',
        '  node scripts/ghl/setup-custom-fields.mjs --env .env.local',
      ].join('\n'),
    );
  }

  if (!apiKey.startsWith('pit-')) {
    fail(
      [
        `GHL_API_KEY does not look like a Private Integration token (it starts "${apiKey.slice(0, 8)}...").`,
        '',
        "GoHighLevel's v2 API at services.leadconnectorhq.com only accepts a",
        'Private Integration token, which always begins with "pit-". A classic',
        'API key (the long "eyJ..." JWT from the location settings) is a v1',
        'credential and will be rejected with 401 by every endpoint this script',
        'calls.',
        '',
        'Create one at: Settings > Private Integrations > Create new integration',
        'Scopes needed: contacts.readonly, contacts.write, locations/customFields.readonly,',
        'locations/customFields.write (add objects/record.write if your account exposes it).',
      ].join('\n'),
    );
  }

  if (!locationId) {
    fail(
      [
        'GHL_LOCATION_ID is not set.',
        '',
        'It is the sub-account id. Find it under Settings > Business Profile',
        '("Location ID"), or read it out of any GHL app URL:',
        '  https://app.gohighlevel.com/v2/location/<GHL_LOCATION_ID>/...',
      ].join('\n'),
    );
  }

  return { apiKey, locationId };
}

async function ghl(apiKey, path, { method = 'GET', body } = {}) {
  const res = await fetch(new URL(path, BASE_URL).toString(), {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`\nGoHighLevel ${method} ${path} failed.`);
    console.error(`  status: ${res.status} ${res.statusText}`);
    console.error(`  body:   ${text || '(empty)'}`);
    if (res.status === 401 || res.status === 403) {
      console.error(
        '\nA 401/403 here is almost always the token: either it is not a "pit-"\n' +
          'Private Integration token, or the integration is missing the\n' +
          'locations/customFields write scope.',
      );
    }
    process.exit(1);
  }
  return text ? JSON.parse(text) : {};
}

/** GHL has shipped several shapes for this list over the years. */
function readFieldList(payload) {
  return payload?.customFields ?? payload?.customField ?? payload?.fields ?? [];
}

const lower = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

/** Match on fieldKey (with or without its "contact." prefix) or on name. */
function findExisting(existing, field) {
  const wantKey = lower(field.key);
  const wantName = lower(field.name);
  return existing.find((f) => {
    const key = lower(f.fieldKey ?? f.key ?? '');
    const bare = key.includes('.') ? key.slice(key.lastIndexOf('.') + 1) : key;
    return bare === wantKey || key === wantKey || lower(f.name) === wantName;
  });
}

function printTable(rows) {
  const headers = ['Field', 'Name', 'Status', 'Id'];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)),
  );
  const line = (cells) => cells.map((c, i) => String(c ?? '').padEnd(widths[i])).join('  ');
  console.log('');
  console.log(line(headers));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const r of rows) console.log(line(r));
}

async function main() {
  const { envPath } = parseArgs(process.argv.slice(2));
  loadEnv(envPath);
  const { apiKey, locationId } = requireCredentials();

  console.log(`GoHighLevel location ${locationId}`);
  console.log('Reading existing contact custom fields...');

  const listed = await ghl(apiKey, `/locations/${encodeURIComponent(locationId)}/customFields`);
  const existing = readFieldList(listed);
  console.log(`  ${existing.length} custom field(s) already on the location.`);

  const ids = {};
  const rows = [];

  for (const field of FIELDS) {
    const match = findExisting(existing, field);
    if (match?.id) {
      ids[field.key] = match.id;
      rows.push([field.key, field.name, 'reused', match.id]);
      continue;
    }
    const created = await ghl(apiKey, `/locations/${encodeURIComponent(locationId)}/customFields`, {
      method: 'POST',
      body: {
        name: field.name,
        dataType: 'TEXT',
        placeholder: field.placeholder,
        model: 'contact',
      },
    });
    const id = created?.customField?.id ?? created?.id ?? created?.customFields?.[0]?.id;
    if (!id) {
      console.error(`\nCreated "${field.name}" but GoHighLevel returned no id:`);
      console.error(JSON.stringify(created, null, 2).slice(0, 800));
      process.exit(1);
    }
    ids[field.key] = id;
    rows.push([field.key, field.name, 'created', id]);
  }

  printTable(rows);

  const created = rows.filter((r) => r[2] === 'created').length;
  console.log(`\n${created} created, ${rows.length - created} reused.`);

  console.log('\nPaste this into .env.local (and the Vercel project env):\n');
  console.log(`GHL_CUSTOM_FIELD_IDS=${JSON.stringify(ids)}`);

  console.log(
    [
      '',
      'Note: this is an optimisation, not a requirement. lib/ghl.ts falls back',
      'to sending the field *keys* above when GHL_CUSTOM_FIELD_IDS is unset,',
      'and it always writes a note on the contact containing every qualifier',
      'answer. The funnel therefore works without ever running this script;',
      'the ids just make the answers land in real, filterable custom fields.',
    ].join('\n'),
  );
}

main().catch((err) => {
  console.error(`Unexpected failure: ${err?.stack || err}`);
  process.exit(1);
});
