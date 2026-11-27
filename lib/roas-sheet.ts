// ---------------------------------------------------------------------------
// /roas-calculator as a workbook: every cell of the original spreadsheet,
// at its original address.
//
// The calculator tabs are laid out exactly as the sheet lays them out (B2 is
// the daily budget, B7:D10 the scenario grid, rows 16–18 the results), so
// the formula shown for a cell is the sheet's own formula, and a visitor who
// downloads or copies the sheet gets formulas that still point at the right
// cells. The arithmetic is not repeated here: values come from
// lib/roas-calc.ts, which is the sheet's math. This file only decides where
// each number sits, how it is shown and what its formula reads.
//
// Pure: no React, no browser globals, so it can be unit-checked in node.
// ---------------------------------------------------------------------------
import {
  BENCHMARKS,
  SCENARIOS,
  run,
  type CalcInputs,
  type Model,
  type ScenarioInputs,
  type ScenarioKey,
} from './roas-calc';

export type CellFormat = 'text' | 'money' | 'int' | 'roas' | 'pct';

/** Where an input cell's number lives in CalcInputs. */
export type InputRef =
  | { field: 'daily' }
  | { field: 'price' }
  | { field: 'grid'; scenario: ScenarioKey; metric: keyof ScenarioInputs };

export interface Cell {
  /**
   * label: text. title: a section title. header: a column header.
   * input: a number the visitor types. formula: computed, read-only.
   * value: a read-only number (the Benchmarks tab).
   */
  kind: 'label' | 'title' | 'header' | 'input' | 'formula' | 'value';
  text?: string;
  value?: number;
  /** The sheet's formula, as Excel / Sheets would show it. */
  formula?: string;
  /** One plain-English line on what the cell means. */
  explain?: string;
  format?: CellFormat;
  input?: InputRef;
  /** Colours a cell by scenario (headers, the results rows). */
  tone?: ScenarioKey;
}

export interface BenchmarkBlock {
  model: Model;
  id: string;
  name: string;
  /** Inclusive, zero-based row and column bounds on the Benchmarks tab. */
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

export interface Sheet {
  rows: number;
  cols: number;
  /** Pixel widths, one per column. */
  widths: number[];
  /** Keyed by address: "B7". */
  cells: Record<string, Cell>;
  /** Benchmarks tab only: the blocks that can be loaded into a calculator. */
  blocks?: BenchmarkBlock[];
}

// ── Addresses ───────────────────────────────────────────────────────────────

export const colName = (c: number) => String.fromCharCode(65 + c);
export const addr = (r: number, c: number) => `${colName(c)}${r + 1}`;

export function parseAddr(a: string): { r: number; c: number } | null {
  const m = /^([A-Z])(\d+)$/.exec(a);
  return m ? { r: parseInt(m[2], 10) - 1, c: m[1].charCodeAt(0) - 65 } : null;
}

/** The cells a formula reads, in the order it names them: "=(C16*B9)/100" → C16, B9. */
export function precedents(formula: string | undefined): string[] {
  if (!formula) return [];
  return Array.from(new Set(formula.match(/[A-Z]\d+/g) ?? []));
}

// ── Display ─────────────────────────────────────────────────────────────────

export function formatValue(n: number, f: CellFormat | undefined): string {
  if (!Number.isFinite(n)) return '';
  switch (f) {
    case 'money':
      // The sheet's [$$]#,##0.00.
      return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'int':
      return Math.round(n).toLocaleString('en-US');
    case 'roas':
      return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'pct':
      return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
    default:
      return String(n);
  }
}

export function display(cell: Cell | undefined): string {
  if (!cell) return '';
  if (cell.value !== undefined) return formatValue(cell.value, cell.format);
  return cell.text ?? '';
}

/** What an input cell shows when it is opened for editing: the bare number. */
export function editText(cell: Cell | undefined): string {
  if (!cell || cell.value === undefined) return '';
  return String(Math.round(cell.value * 10000) / 10000);
}

// ── Typing into a cell ──────────────────────────────────────────────────────

/**
 * Reads what a visitor typed: "1,200", "$1,200.50", "70%", or a formula of
 * plain arithmetic like "=165*1.2" or "=(200+50)/2". Returns null for
 * anything it cannot read. Cell references are not supported in input
 * cells; those cells are the sheet's inputs, not its formulas.
 */
export function parseEntry(raw: string): number | null {
  const s = raw.trim().replace(/[$,\s]/g, '').replace(/%$/, '');
  if (s === '') return 0;
  if (s.startsWith('=')) return evaluate(s.slice(1));
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** + - * / and parentheses, by recursive descent. No eval. */
function evaluate(src: string): number | null {
  const tokens = src.match(/\d*\.?\d+|[()+\-*/]/g);
  if (!tokens || tokens.join('') !== src) return null;
  let i = 0;
  const peek = () => tokens[i];
  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') v = tokens[i++] === '+' ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (peek() === '*' || peek() === '/') v = tokens[i++] === '*' ? v * factor() : v / factor();
    return v;
  };
  const factor = (): number => {
    const t = tokens[i++];
    if (t === '-') return -factor();
    if (t === '+') return factor();
    if (t === '(') {
      const v = expr();
      if (tokens[i++] !== ')') throw new Error('paren');
      return v;
    }
    const n = parseFloat(t ?? '');
    if (!Number.isFinite(n)) throw new Error('num');
    return n;
  };
  try {
    const v = expr();
    return i === tokens.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const LIMITS: Record<string, number> = {
  daily: 1_000_000,
  price: 100_000_000,
  cpl: 1_000_000,
  cpbc: 1_000_000,
  show: 100,
  close: 100,
};

/** A copy of the inputs with one cell changed, clamped to its sane range. */
export function setInput(inputs: CalcInputs, ref: InputRef, raw: number): CalcInputs {
  const key = ref.field === 'grid' ? ref.metric : ref.field;
  const v = Math.min(LIMITS[key], Math.max(0, raw));
  if (ref.field === 'daily') return { ...inputs, daily: v };
  if (ref.field === 'price') return { ...inputs, price: v };
  return {
    ...inputs,
    grid: { ...inputs.grid, [ref.scenario]: { ...inputs.grid[ref.scenario], [ref.metric]: v } },
  };
}

// ── The calculator tabs ─────────────────────────────────────────────────────

const SCENARIO_COL: Record<ScenarioKey, number> = { best: 1, average: 2, worst: 3 };
const RESULT_ROW: Record<ScenarioKey, number> = { best: 15, average: 16, worst: 17 };
const CASE_LABEL: Record<ScenarioKey, string> = { best: 'Best Case', average: 'Average Case', worst: 'Worst Case' };

const METRIC_ROWS: readonly { metric: keyof ScenarioInputs; row: number; label: string; format: CellFormat; explain: string }[] = [
  { metric: 'cpl', row: 6, label: 'Cost Per Lead (CPL)', format: 'money', explain: 'What one lead costs in ad spend.' },
  { metric: 'cpbc', row: 7, label: 'Cost Per Booked Call (CPBC)', format: 'money', explain: 'What one booked call costs in ad spend.' },
  { metric: 'show', row: 8, label: 'Show-Up Rate (%)', format: 'pct', explain: 'Out of 100 booked calls, how many happen.' },
  { metric: 'close', row: 9, label: 'Close Rate (%)', format: 'pct', explain: 'Out of 100 calls that happen, how many buy.' },
];

export function calcSheet(inputs: CalcInputs): Sheet {
  const { spend, results } = run(inputs);
  const cells: Record<string, Cell> = {};
  const put = (r: number, c: number, cell: Cell) => {
    cells[addr(r, c)] = cell;
  };

  put(0, 1, { kind: 'title', text: 'Input Data Here' });
  put(1, 0, { kind: 'label', text: 'Ad Spend Budget (Daily)' });
  put(1, 1, {
    kind: 'input',
    value: inputs.daily,
    format: 'money',
    input: { field: 'daily' },
    explain: 'Your ad budget per day.',
  });
  put(1, 2, {
    kind: 'formula',
    value: spend,
    format: 'money',
    formula: '=B2*30',
    explain: 'Monthly ad spend: the daily budget × 30 days.',
  });
  put(2, 0, { kind: 'label', text: 'Offer Contract Price' });
  put(2, 1, {
    kind: 'input',
    value: inputs.price,
    format: 'money',
    input: { field: 'price' },
    explain: 'What a client pays you for one sale.',
  });

  for (const { key, label } of SCENARIOS) put(5, SCENARIO_COL[key], { kind: 'header', text: label.replace(' case', ''), tone: key });
  for (const m of METRIC_ROWS) {
    put(m.row, 0, { kind: 'label', text: m.label });
    for (const { key, label } of SCENARIOS) {
      put(m.row, SCENARIO_COL[key], {
        kind: 'input',
        value: inputs.grid[key][m.metric],
        format: m.format,
        input: { field: 'grid', scenario: key, metric: m.metric },
        explain: `${m.explain} ${label}.`,
      });
    }
  }

  put(13, 0, { kind: 'title', text: 'Performance Metrics' });
  ['Scenario', 'Number of Leads', 'Number of Calls', 'Number of Showed Calls', 'Number of Sales', 'Revenue Generated', 'ROAS'].forEach(
    (t, c) => put(14, c, { kind: 'header', text: t }),
  );

  for (const { key } of SCENARIOS) {
    const r = RESULT_ROW[key];
    const n = r + 1; // the row number as the sheet writes it
    const col = colName(SCENARIO_COL[key]);
    const res = results[key];
    put(r, 0, { kind: 'label', text: CASE_LABEL[key], tone: key });
    put(r, 1, {
      kind: 'formula',
      value: res.leads,
      format: 'int',
      formula: `=C2/${col}7`,
      explain: 'Leads: monthly spend ÷ cost per lead.',
      tone: key,
    });
    put(r, 2, {
      kind: 'formula',
      value: res.calls,
      format: 'int',
      formula: `=C2/${col}8`,
      explain: 'Booked calls: monthly spend ÷ cost per booked call.',
      tone: key,
    });
    put(r, 3, {
      kind: 'formula',
      value: res.showed,
      format: 'int',
      formula: `=(C${n}*${col}9)/100`,
      explain: 'Calls that happen: booked calls × show-up rate.',
      tone: key,
    });
    put(r, 4, {
      kind: 'formula',
      value: res.sales,
      format: 'int',
      formula: `=(D${n}*${col}10)/100`,
      explain: 'Sales: showed calls × close rate.',
      tone: key,
    });
    put(r, 5, {
      kind: 'formula',
      value: res.revenue,
      format: 'money',
      formula: `=ROUND(E${n},0)*B3`,
      explain: 'Revenue: sales rounded to whole clients × the offer price.',
      tone: key,
    });
    put(r, 6, {
      kind: 'formula',
      value: res.roas,
      format: 'roas',
      formula: `=F${n}/C2`,
      explain: 'ROAS: revenue ÷ monthly ad spend. 1.00 gets the ad spend back.',
      tone: key,
    });
  }

  return { rows: 18, cols: 7, widths: [232, 150, 150, 170, 150, 170, 110], cells };
}

// ── The Benchmarks tab ──────────────────────────────────────────────────────

const BLOCK_ROW: Record<string, number> = { follower: 3, dm: 10, vsl: 17, leadform: 24 };
const BLOCK_TITLE: Record<string, string> = {
  follower: 'Follower Funnel:',
  dm: 'DM Ads AND Indirect Conversion Ads:',
  vsl: 'Direct VSL/Application Ads:',
  leadform: 'Lead Form:',
};

export function benchmarkSheet(): Sheet {
  const cells: Record<string, Cell> = {};
  const blocks: BenchmarkBlock[] = [];
  const sides: { model: Model; c0: number }[] = [
    { model: 'b2c', c0: 0 },
    { model: 'b2b', c0: 5 },
  ];
  for (const { model, c0 } of sides) {
    cells[addr(0, c0)] = { kind: 'title', text: model.toUpperCase() };
    for (const b of BENCHMARKS[model]) {
      const r0 = BLOCK_ROW[b.id];
      cells[addr(r0, c0)] = { kind: 'title', text: BLOCK_TITLE[b.id] ?? b.name };
      SCENARIOS.forEach(({ key, label }, i) => {
        cells[addr(r0, c0 + 1 + i)] = { kind: 'header', text: label.replace(' case', ''), tone: key };
      });
      METRIC_ROWS.forEach((m, j) => {
        const r = r0 + 1 + j;
        cells[addr(r, c0)] = { kind: 'label', text: m.label };
        SCENARIOS.forEach(({ key }, i) => {
          cells[addr(r, c0 + 1 + i)] = {
            kind: 'value',
            value: b.grid[key][m.metric],
            format: m.format,
            explain: `${model.toUpperCase()} benchmark, ${b.name.toLowerCase()}. ${m.explain}`,
            tone: key,
          };
        });
      });
      blocks.push({ model, id: b.id, name: b.name, r0, r1: r0 + 4, c0, c1: c0 + 3 });
    }
  }
  return { rows: 29, cols: 9, widths: [262, 104, 104, 104, 28, 262, 104, 104, 104], cells, blocks };
}

export function blockAt(sheet: Sheet, r: number, c: number): BenchmarkBlock | null {
  return sheet.blocks?.find((b) => r >= b.r0 && r <= b.r1 && c >= b.c0 && c <= b.c1) ?? null;
}

// ── Getting it out ──────────────────────────────────────────────────────────

const csvField = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/**
 * The sheet as rows of strings. withFormulas: computed cells carry their
 * formula instead of their value, so the file or the paste opens in Excel
 * or Google Sheets as a working calculator, not a picture of one.
 */
function matrix(sheet: Sheet, withFormulas: boolean): string[][] {
  const out: string[][] = [];
  for (let r = 0; r < sheet.rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < sheet.cols; c++) {
      const cell = sheet.cells[addr(r, c)];
      if (!cell) row.push('');
      else if (cell.kind === 'formula' && withFormulas && cell.formula) row.push(cell.formula);
      else if (cell.value !== undefined) row.push(String(cell.value));
      else row.push(cell.text ?? '');
    }
    out.push(row);
  }
  // Trailing empty rows and columns add nothing to a paste.
  while (out.length && out[out.length - 1].every((v) => v === '')) out.pop();
  return out;
}

export function toCsv(sheet: Sheet): string {
  return matrix(sheet, true)
    .map((row) => row.map(csvField).join(','))
    .join('\r\n');
}

export function toTsv(sheet: Sheet, withFormulas: boolean): string {
  return matrix(sheet, withFormulas)
    .map((row) => row.join('\t'))
    .join('\n');
}

/** A rectangle of the sheet as tab-separated values (what Ctrl+C copies). */
export function rangeTsv(sheet: Sheet, r0: number, c0: number, r1: number, c1: number): string {
  const lines: string[] = [];
  for (let r = r0; r <= r1; r++) {
    const row: string[] = [];
    for (let c = c0; c <= c1; c++) {
      const cell = sheet.cells[addr(r, c)];
      row.push(cell ? (cell.value !== undefined ? String(Math.round(cell.value * 10000) / 10000) : cell.text ?? '') : '');
    }
    lines.push(row.join('\t'));
  }
  return lines.join('\n');
}
