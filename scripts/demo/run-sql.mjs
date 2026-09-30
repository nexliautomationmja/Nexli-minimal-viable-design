#!/usr/bin/env node
/**
 * Run a .sql file against the Neon database, one statement at a time.
 *
 *   node scripts/demo/run-sql.mjs <file.sql> [--env <path>]
 *
 * Examples:
 *   node scripts/demo/run-sql.mjs scripts/add-foundation-columns.sql --env .env.local
 *   node scripts/demo/run-sql.mjs dashboard/scripts/add-firm-sites.sql --env dashboard/.env.local
 *
 * Reads DATABASE_URL (or POSTGRES_URL) from the environment; --env loads a
 * dotenv-style file first (Node 22 built-in, no dependency). Statements are
 * split on ';' outside single-quoted strings and $$ ... $$ blocks, so
 * plpgsql function bodies survive intact.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

function usage(message) {
  if (message) console.error(`Error: ${message}\n`);
  console.error('Usage: node scripts/demo/run-sql.mjs <file.sql> [--env <path>]');
  process.exit(1);
}

function parseArgs(argv) {
  let file = null;
  let envPath = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env') {
      envPath = argv[++i];
      if (!envPath) usage('--env requires a path');
    } else if (a === '-h' || a === '--help') {
      usage();
    } else if (a.startsWith('-')) {
      usage(`Unknown option ${a}`);
    } else if (file) {
      usage('Only one .sql file may be given');
    } else {
      file = a;
    }
  }
  if (!file) usage('Missing <file.sql>');
  return { file, envPath };
}

/** Strip `-- comment` lines/tails (outside quotes) and split into statements. */
export function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDollar = false;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (!inSingle && !inDollar && ch === '-' && next === '-') {
      // Line comment: skip to end of line.
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    if (!inSingle && ch === '$' && next === '$') {
      inDollar = !inDollar;
      current += '$$';
      i += 2;
      continue;
    }

    if (!inDollar && ch === "'") {
      // '' inside a string is an escaped quote; treat it as two toggles.
      inSingle = !inSingle;
      current += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDollar && ch === ';') {
      const s = current.trim();
      if (s) statements.push(s);
      current = '';
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function main() {
  const { file, envPath } = parseArgs(process.argv.slice(2));

  if (envPath) {
    try {
      process.loadEnvFile(resolve(process.cwd(), envPath));
    } catch (err) {
      usage(`Could not load env file ${envPath}: ${err.message}`);
    }
  }

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) usage('DATABASE_URL (or POSTGRES_URL) is not set. Pass --env <path> or export it.');

  const sqlPath = resolve(process.cwd(), file);
  let text;
  try {
    text = readFileSync(sqlPath, 'utf8');
  } catch (err) {
    usage(`Could not read ${sqlPath}: ${err.message}`);
  }

  const stmts = splitSqlStatements(text);
  if (stmts.length === 0) {
    console.log('No statements found.');
    return;
  }

  const sql = neon(url);
  console.log(`Running ${stmts.length} statement(s) from ${sqlPath}`);
  for (let i = 0; i < stmts.length; i++) {
    const s = stmts[i];
    const label = s.replace(/\s+/g, ' ').slice(0, 70);
    try {
      await sql.query(s);
      console.log(`[${i + 1}/${stmts.length}] ok  ${label}`);
    } catch (err) {
      console.error(`[${i + 1}/${stmts.length}] FAILED\n\n${s}\n`);
      console.error(err.message || err);
      process.exit(1);
    }
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
