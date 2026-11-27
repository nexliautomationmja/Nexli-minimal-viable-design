'use client';

// ---------------------------------------------------------------------------
// The ROAS workbook: a spreadsheet in Nexli's skin.
//
// It behaves like the sheet it copies. Click or arrow to a cell; type to
// replace it, Enter or F2 or double-click to edit it, Tab and Enter to move
// on. Shift+arrows or a drag selects a range, the status bar sums it, and
// Ctrl+C / Ctrl+V copy and paste with Excel and Google Sheets. Selecting a
// formula shows it in the formula bar and outlines the cells it reads, the
// way Excel colours a formula's references.
//
// Inputs (the blue cells) are the only editable ones, and they take plain
// arithmetic too ("=200*1.1"). Every computed cell is the sheet's own
// formula at the sheet's own address: see lib/roas-sheet.ts.
//
// State it owns: selection and the cell being edited. The numbers belong to
// the page (app/roas-calculator/roas-client.tsx), which keeps undo history.
// ---------------------------------------------------------------------------
import React, { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, ClipboardCopy, Download, LayoutGrid, Redo2, RotateCcw, Rows3, Sigma, Undo2, Upload } from 'lucide-react';
import { EditorSheet, MobileBenchmarks, MobileCalc } from './mobile';
import {
  addr,
  benchmarkSheet,
  blockAt,
  calcSheet,
  colName,
  display,
  editText,
  parseAddr,
  parseEntry,
  precedents,
  rangeTsv,
  setInput,
  toCsv,
  toTsv,
  type Cell,
  type Sheet,
} from '@/lib/roas-sheet';
import { BENCHMARKS, DEFAULTS, MODEL_LABEL, type CalcInputs, type Grid, type Model, type ScenarioKey } from '@/lib/roas-calc';

export type Tab = Model | 'benchmarks';

const ROW_H = 38;
const HEAD_H = 28;
const NUM_W = 44;

/** Excel's reference colours, in Nexli's palette. */
const REF_COLORS = ['#60a5fa', '#f472b6', '#a78bfa', '#34d399', '#fbbf24'];

const TONE_TEXT: Record<ScenarioKey, string> = {
  best: 'text-emerald-300',
  average: 'text-cyan-300',
  worst: 'text-amber-200',
};
const TONE_DOT: Record<ScenarioKey, string> = {
  best: 'bg-emerald-400',
  average: 'bg-cyan-400',
  worst: 'bg-amber-400',
};

interface Pos {
  r: number;
  c: number;
}
interface Editing {
  r: number;
  c: number;
  text: string;
  /** Where the caret is: in the cell, up in the formula bar, or in the
   *  phone's bottom-sheet editor. */
  from: 'cell' | 'bar' | 'sheet';
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const fmtStat = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

// ── One cell ────────────────────────────────────────────────────────────────

const CellView = memo(function CellView({ cell, width, flash }: { cell: Cell | undefined; width: number; flash: boolean }) {
  const text = display(cell);
  const base = 'relative flex h-full items-center overflow-hidden border-b border-r border-white/[0.06] px-2.5';
  if (!cell) return <div className={base} style={{ width }} />;

  if (cell.kind === 'title') {
    return (
      <div className={`${base} font-black tracking-tight`} style={{ width }}>
        <span className="whitespace-nowrap bg-gradient-to-r from-blue-300 via-violet-300 to-cyan-200 bg-clip-text text-[13px] text-transparent sm:text-sm">
          {text}
        </span>
      </div>
    );
  }
  if (cell.kind === 'header') {
    return (
      <div className={`${base} bg-white/[0.03]`} style={{ width }}>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-white/60">
          {cell.tone && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[cell.tone]}`} aria-hidden="true" />}
          {text}
        </span>
      </div>
    );
  }
  if (cell.kind === 'label') {
    return (
      <div className={base} style={{ width }}>
        <span className={`truncate text-[13px] font-semibold ${cell.tone ? 'text-white' : 'text-white/80'}`}>
          {cell.tone && <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${TONE_DOT[cell.tone]}`} aria-hidden="true" />}
          {text}
        </span>
      </div>
    );
  }

  const isInput = cell.kind === 'input';
  const isRoas = cell.format === 'roas';
  const losing = isRoas && (cell.value ?? 0) < 1;
  const color = isInput
    ? 'text-sky-200'
    : losing
      ? 'text-rose-300'
      : cell.kind === 'value'
        ? 'text-white/85'
        : cell.tone
          ? TONE_TEXT[cell.tone]
          : 'text-cyan-200';

  return (
    <div className={`${base} justify-end ${isInput ? 'bg-blue-500/[0.07]' : ''}`} style={{ width }}>
      {/* The blue corner marks a cell you can type in. */}
      {isInput && (
        <span aria-hidden="true" className="absolute left-0 top-0 h-0 w-0 border-r-[7px] border-t-[7px] border-r-transparent border-t-sky-400/60" />
      )}
      <motion.span
        key={text}
        initial={flash ? { backgroundColor: 'rgba(34,211,238,0.32)', scale: 1.06 } : false}
        animate={{ backgroundColor: 'rgba(34,211,238,0)', scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`-mx-1 rounded px-1 text-[13px] tabular-nums sm:text-sm ${isRoas ? 'font-black' : isInput ? 'font-bold' : 'font-semibold'} ${color}`}
      >
        {text}
      </motion.span>
    </div>
  );
});

// ── The workbook ────────────────────────────────────────────────────────────

export default function Workbook({
  tab,
  onTab,
  all,
  onCommit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onLoad,
  lastModel = 'b2c',
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  all: Record<Model, CalcInputs>;
  onCommit: (model: Model, next: CalcInputs) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Load a scenario grid into a calculator tab and switch to it. */
  onLoad: (model: Model, grid: Grid) => void;
  /** The calculator tab last shown, so Benchmarks opens on its side on a phone. */
  lastModel?: Model;
}) {
  const model: Model | null = tab === 'benchmarks' ? null : tab;
  const sheet: Sheet = useMemo(() => (model ? calcSheet(all[model]) : benchmarkSheet()), [model, all]);

  const [anchor, setAnchor] = useState<Pos>({ r: 1, c: 1 });
  const [focus, setFocus] = useState<Pos>({ r: 1, c: 1 });
  const [editing, setEditing] = useState<Editing | null>(null);
  const [note, setNote] = useState<{ text: string; ok?: boolean } | null>(null);
  const [flash, setFlash] = useState(false);
  const dragging = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabPill = useId();
  const tabPillMobile = useId();
  // The phone editor is portalled to <body>: an ancestor with a transform
  // (the page's entrance animation) would otherwise trap position: fixed.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);
  const mobileSel = useId();
  /** Phones get the sheet re-laid to fit (./mobile.tsx); "Grid" shows the real one. */
  const [mobileView, setMobileView] = useState<'compact' | 'grid'>('compact');

  // No flash on first paint or on a tab switch: only on a value changing.
  useEffect(() => {
    setFlash(false);
    const t = setTimeout(() => setFlash(true), 80);
    return () => clearTimeout(t);
  }, [tab]);

  // A fresh tab starts on its first input, the way the sheet opens.
  useEffect(() => {
    const start = tab === 'benchmarks' ? { r: 4, c: 1 } : { r: 1, c: 1 };
    setAnchor(start);
    setFocus(start);
    setEditing(null);
    setNote(null);
  }, [tab]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 3200);
    return () => clearTimeout(t);
  }, [note]);

  useEffect(() => {
    const up = () => (dragging.current = false);
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  const r0 = Math.min(anchor.r, focus.r);
  const r1 = Math.max(anchor.r, focus.r);
  const c0 = Math.min(anchor.c, focus.c);
  const c1 = Math.max(anchor.c, focus.c);
  const multi = r0 !== r1 || c0 !== c1;
  const focusAddr = addr(focus.r, focus.c);
  const focusCell = sheet.cells[focusAddr];
  const refs = focusCell?.kind === 'formula' ? precedents(focusCell.formula) : [];

  // On a phone the sheet's desktop widths push the labels off screen the
  // moment you move right, so the columns tighten below 640px.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const widths = useMemo(
    () => (narrow ? sheet.widths.map((w, i) => (i === 0 ? Math.min(w, 158) : Math.min(w, 112))) : sheet.widths),
    [narrow, sheet.widths],
  );

  // Pixel geometry. Rows are a fixed height and columns fixed widths, so a
  // rectangle is arithmetic, and the selection can glide between cells.
  const lefts = useMemo(() => {
    const out = [NUM_W];
    widths.forEach((w, i) => out.push(out[i] + w));
    return out;
  }, [widths]);
  const rect = (ra: number, ca: number, rb: number, cb: number) => ({
    left: lefts[ca],
    top: HEAD_H + ra * ROW_H,
    width: lefts[cb + 1] - lefts[ca],
    height: (rb - ra + 1) * ROW_H,
  });
  const totalW = lefts[lefts.length - 1];

  const keepInView = useCallback(
    (p: Pos) => {
      const el = scrollRef.current;
      if (!el) return;
      const left = lefts[p.c];
      const right = lefts[p.c + 1];
      if (right > el.scrollLeft + el.clientWidth) el.scrollLeft = right - el.clientWidth + 8;
      else if (left - NUM_W < el.scrollLeft) el.scrollLeft = Math.max(0, left - NUM_W - 8);
    },
    [lefts],
  );

  const select = (p: Pos, extend = false) => {
    const q = { r: clamp(p.r, 0, sheet.rows - 1), c: clamp(p.c, 0, sheet.cols - 1) };
    setFocus(q);
    if (!extend) setAnchor(q);
    keepInView(q);
  };

  // ── Editing ──
  const startEdit = (p: Pos, text: string | null, from: Editing['from'] = 'cell') => {
    const cell = sheet.cells[addr(p.r, p.c)];
    if (cell?.kind !== 'input') {
      if (cell?.kind === 'formula') setNote({ text: 'That cell is a formula. Change the blue cells and it updates.' });
      else if (cell?.kind === 'value') setNote({ text: 'Benchmarks are read-only. Load a block into a calculator to edit it.' });
      return;
    }
    setEditing({ ...p, text: text ?? editText(cell), from });
  };

  // The edit being committed, cleared the moment it is: committing moves
  // focus back to the grid, which blurs the editor, and its onBlur must not
  // commit the same edit a second time (a duplicate undo step).
  const live = useRef<Editing | null>(null);
  live.current = editing;

  const commit = (text: string, move: Pos | null) => {
    if (!live.current || !editing || !model) return setEditing(null);
    live.current = null;
    const cell = sheet.cells[addr(editing.r, editing.c)];
    const n = parseEntry(text);
    if (cell?.input && n !== null) {
      if (n !== cell.value) onCommit(model, setInput(all[model], cell.input, n));
    } else if (n === null) {
      setNote({ text: 'Type a number, or arithmetic like =200*1.1' });
    }
    const at = { r: editing.r, c: editing.c };
    const from = editing.from;
    setEditing(null);
    if (move) select({ r: at.r + move.r, c: at.c + move.c });
    // The phone editor has no grid to return to (and focusing it would drop
    // the keyboard between Prev / Next).
    if (from !== 'sheet') gridRef.current?.focus({ preventScroll: true });
  };

  // ── Clipboard ──
  const copySelection = async (e?: React.ClipboardEvent) => {
    const tsv = rangeTsv(sheet, r0, c0, r1, c1);
    if (e) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', tsv);
    } else {
      try {
        await navigator.clipboard.writeText(tsv);
      } catch {
        return setNote({ text: 'Your browser blocked the clipboard.' });
      }
    }
    setNote({ text: `Copied ${multi ? `${(r1 - r0 + 1) * (c1 - c0 + 1)} cells` : focusAddr}`, ok: true });
  };

  const paste = (text: string) => {
    if (!model) return setNote({ text: 'Benchmarks are read-only.' });
    const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
    const single = rows.length === 1 && rows[0].length === 1;
    let next = all[model];
    let wrote = 0;
    let skipped = 0;
    // One value into a range fills the range, as in Excel; otherwise the
    // block lands with its top-left on the selection's top-left.
    const height = single ? r1 - r0 + 1 : rows.length;
    for (let i = 0; i < height; i++) {
      const width = single ? c1 - c0 + 1 : rows[i].length;
      for (let j = 0; j < width; j++) {
        const raw = single ? rows[0][0] : rows[i][j];
        const cell = sheet.cells[addr(r0 + i, c0 + j)];
        if (cell?.kind !== 'input' || !cell.input) {
          if (raw.trim()) skipped++;
          continue;
        }
        const n = parseEntry(raw);
        if (n === null) {
          skipped++;
          continue;
        }
        next = setInput(next, cell.input, n);
        wrote++;
      }
    }
    if (wrote) onCommit(model, next);
    setNote(
      wrote
        ? { text: `Pasted ${wrote} ${wrote === 1 ? 'cell' : 'cells'}${skipped ? `, skipped ${skipped} that aren’t inputs` : ''}`, ok: true }
        : { text: 'Nothing to paste here: only the blue cells take values.' },
    );
  };

  const clearSelection = () => {
    if (!model) return;
    let next = all[model];
    let n = 0;
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const cell = sheet.cells[addr(r, c)];
        if (cell?.input) {
          next = setInput(next, cell.input, 0);
          n++;
        }
      }
    if (n) onCommit(model, next);
  };

  // ── Keyboard, while the grid has focus and nothing is being edited ──
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (editing) return;
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key;
    if (mod && k.toLowerCase() === 'z') {
      e.preventDefault();
      return e.shiftKey ? onRedo() : onUndo();
    }
    if (mod && k.toLowerCase() === 'y') {
      e.preventDefault();
      return onRedo();
    }
    if (mod && k.toLowerCase() === 'a') {
      e.preventDefault();
      setAnchor({ r: 0, c: 0 });
      setFocus({ r: sheet.rows - 1, c: sheet.cols - 1 });
      return;
    }
    if (mod) return; // let Ctrl+C / Ctrl+V reach the clipboard events
    const moves: Record<string, Pos> = {
      ArrowUp: { r: -1, c: 0 },
      ArrowDown: { r: 1, c: 0 },
      ArrowLeft: { r: 0, c: -1 },
      ArrowRight: { r: 0, c: 1 },
    };
    if (moves[k]) {
      e.preventDefault();
      return select({ r: focus.r + moves[k].r, c: focus.c + moves[k].c }, e.shiftKey);
    }
    if (k === 'Tab') {
      e.preventDefault();
      return select({ r: focus.r, c: focus.c + (e.shiftKey ? -1 : 1) });
    }
    if (k === 'Enter' || k === 'F2') {
      e.preventDefault();
      if (k === 'Enter' && focusCell?.kind !== 'input') return select({ r: focus.r + (e.shiftKey ? -1 : 1), c: focus.c });
      return startEdit(focus, null);
    }
    if (k === 'Escape') return setAnchor(focus);
    if (k === 'Delete' || k === 'Backspace') {
      e.preventDefault();
      return clearSelection();
    }
    if (k.length === 1 && /[\d.=$\-+(]/.test(k)) {
      e.preventDefault();
      startEdit(focus, k);
    }
  };

  // ── Pointer ──
  const posFromEvent = (e: React.PointerEvent): Pos | null => {
    const host = gridRef.current;
    if (!host) return null;
    const b = host.getBoundingClientRect();
    const x = e.clientX - b.left;
    const y = e.clientY - b.top - HEAD_H;
    if (x < NUM_W || y < 0) return null;
    const r = Math.floor(y / ROW_H);
    const c = lefts.findIndex((l, i) => i < sheet.cols && x >= l && x < lefts[i + 1]);
    return r >= 0 && r < sheet.rows && c >= 0 ? { r, c } : null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = posFromEvent(e);
    if (!p) return;
    if (e.pointerType === 'mouse') e.preventDefault();
    gridRef.current?.focus({ preventScroll: true });
    if (editing) commit(editing.text, null);
    const same = p.r === focus.r && p.c === focus.c && !multi;
    select(p, e.shiftKey);
    // A tap on an input cell on a phone opens it straight away (there's no
    // keyboard to type over it with); a click on a selected one does too.
    if (!e.shiftKey && (e.pointerType !== 'mouse' || same) && sheet.cells[addr(p.r, p.c)]?.kind === 'input') {
      startEdit(p, null, e.pointerType === 'mouse' ? 'cell' : 'sheet');
      return;
    }
    if (e.pointerType === 'mouse') dragging.current = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const p = posFromEvent(e);
    if (p && (p.r !== focus.r || p.c !== focus.c)) setFocus(p);
  };

  // ── Phone: tap to select, tap a blue cell to edit, step through inputs ──
  const inputOrder = useMemo(() => {
    const out: Pos[] = [];
    for (let r = 0; r < sheet.rows; r++)
      for (let c = 0; c < sheet.cols; c++) if (sheet.cells[addr(r, c)]?.kind === 'input') out.push({ r, c });
    return out;
  }, [sheet]);

  const onMobileTap = (r: number, c: number) => {
    if (editing) commit(editing.text, null);
    select({ r, c });
    if (sheet.cells[addr(r, c)]?.kind === 'input') startEdit({ r, c }, null, 'sheet');
  };

  const stepEdit = (dir: -1 | 1) => {
    if (!editing) return;
    const i = inputOrder.findIndex((p) => p.r === editing.r && p.c === editing.c);
    const next = inputOrder[(i + dir + inputOrder.length) % inputOrder.length];
    commit(editing.text, null);
    select(next);
    startEdit(next, null, 'sheet');
  };

  const editTitle = (() => {
    if (!editing) return '';
    const label = sheet.cells[addr(editing.r, 0)]?.text ?? '';
    const head = model && editing.r >= 6 && editing.r <= 9 ? sheet.cells[addr(5, editing.c)]?.text : undefined;
    return head ? `${label} · ${head}` : label;
  })();
  const editPos = editing ? inputOrder.findIndex((p) => p.r === editing.r && p.c === editing.c) + 1 : 0;

  // ── Toolbar actions ──
  const download = () => {
    const name = model ? `roas-calculator-${model}.csv` : 'roas-benchmarks.csv';
    const blob = new Blob([toCsv(sheet)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNote({ text: 'Downloaded. The formulas come with it: it opens as a working sheet.', ok: true });
  };

  const copySheet = async () => {
    try {
      await navigator.clipboard.writeText(toTsv(sheet, true));
      setNote({ text: 'Sheet copied with formulas. Paste it into cell A1 of Excel or Google Sheets.', ok: true });
    } catch {
      setNote({ text: 'Your browser blocked the clipboard.' });
    }
  };

  const block = !model ? blockAt(sheet, focus.r, focus.c) : null;
  const blockGrid = block ? BENCHMARKS[block.model].find((b) => b.id === block.id)?.grid : undefined;

  // ── Status bar ──
  const stats = useMemo(() => {
    if (!multi) return null;
    const nums: number[] = [];
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const v = sheet.cells[addr(r, c)]?.value;
        if (v !== undefined) nums.push(v);
      }
    if (!nums.length) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return { sum, avg: sum / nums.length, count: nums.length };
  }, [multi, r0, r1, c0, c1, sheet]);

  const barValue = editing
    ? editing.text
    : focusCell?.kind === 'formula'
      ? focusCell.formula ?? ''
      : focusCell?.kind === 'input' || focusCell?.kind === 'value'
        ? editText(focusCell)
        : focusCell?.text ?? '';

  const editRect = editing ? rect(editing.r, editing.c, editing.r, editing.c) : null;
  const tabs: { id: Tab; label: string; short: string }[] = [
    { id: 'b2c', label: 'B2C - ROAS Calculator', short: 'B2C' },
    { id: 'b2b', label: 'B2B - ROAS Calculator', short: 'B2B' },
    { id: 'benchmarks', label: 'Benchmarks', short: 'Benchmarks' },
  ];

  const toolBtn =
    'inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[13px] font-semibold text-white/75 transition-colors hover:border-white/25 hover:text-white disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className="overflow-hidden rounded-[calc(1.5rem-1.5px)]">
      {/* ── Phone: the sheet tabs live on top, where a thumb finds them,
            not under an 18-row grid. ── */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:hidden">
        <div role="tablist" aria-label="Sheets" className="grid min-w-0 flex-1 grid-cols-[1fr_1fr_1.45fr] gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => onTab(t.id)}
                className={`relative rounded-lg py-2 text-[13px] font-bold transition-colors ${on ? 'text-white' : 'text-white/55'}`}
              >
                {on && (
                  <motion.span
                    layoutId={tabPillMobile}
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t.short}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setMobileView((v) => (v === 'compact' ? 'grid' : 'compact'))}
          aria-pressed={mobileView === 'grid'}
          aria-label={mobileView === 'grid' ? 'Show the phone layout' : 'Show the full grid'}
          className={`flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl border px-2.5 text-[12px] font-bold transition-colors ${
            mobileView === 'grid' ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/[0.04] text-white/70'
          }`}
        >
          {mobileView === 'grid' ? <Rows3 className="h-4 w-4" aria-hidden="true" /> : <LayoutGrid className="h-4 w-4" aria-hidden="true" />}
          {mobileView === 'grid' ? 'Fit' : 'Grid'}
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:flex-wrap sm:px-4">
        <button type="button" className={toolBtn} onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className={toolBtn} onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Y)">
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" aria-hidden="true" />

        {model ? (
          <>
            <label className="relative min-w-0 flex-1 sm:flex-none">
              <span className="sr-only">Load a benchmark into this sheet</span>
              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const grid = v === 'default' ? DEFAULTS[model].grid : BENCHMARKS[model].find((b) => b.id === v)?.grid;
                  if (grid) {
                    onLoad(model, grid);
                    setNote({ text: `Loaded ${v === 'default' ? 'the sheet’s default numbers' : 'the benchmark'} into B7:D10`, ok: true });
                  }
                }}
                className={`${toolBtn} w-full cursor-pointer appearance-none truncate pr-7 [&>option]:bg-slate-900`}
              >
                <option value="">Load benchmark…</option>
                <option value="default">Sheet default</option>
                {BENCHMARKS[model].map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Upload className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" aria-hidden="true" />
            </label>
            <button
              type="button"
              className={toolBtn}
              onClick={() => {
                onCommit(model, DEFAULTS[model]);
                setNote({ text: `${MODEL_LABEL[model]} sheet reset to its defaults`, ok: true });
              }}
              title="Reset this sheet"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className={`${toolBtn} ${block ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : ''} ${mobileView === 'compact' ? 'max-sm:hidden' : 'max-sm:min-w-0 max-sm:flex-1 max-sm:truncate'}`}
            disabled={!block || !blockGrid}
            onClick={() => block && blockGrid && onLoad(block.model, blockGrid)}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {block ? `Load “${block.name}” into ${MODEL_LABEL[block.model]}` : 'Select a block to load it'}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button type="button" className={`${toolBtn} max-sm:hidden`} onClick={copySheet} title="Copy the sheet with its formulas">
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Copy sheet</span>
          </button>
          <button type="button" className={toolBtn} onClick={download} title="Download as CSV, formulas included">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>

      {/* ── Formula bar ── */}
      <div className="flex items-stretch border-b border-white/10 text-sm">
        <div className="flex w-[84px] shrink-0 items-center justify-center border-r border-white/10 font-mono text-[13px] font-bold text-white/80 sm:w-24">
          {multi ? `${addr(r0, c0)}:${addr(r1, c1)}` : focusAddr}
        </div>
        <div className="flex shrink-0 items-center border-r border-white/10 px-2.5 font-serif text-[15px] italic text-cyan-300/80" aria-hidden="true">
          fx
        </div>
        <input
          aria-label={`Contents of ${focusAddr}`}
          value={barValue}
          readOnly={focusCell?.kind !== 'input' || !model}
          onFocus={() => {
            if (focusCell?.kind === 'input' && !editing) startEdit(focus, null, 'bar');
          }}
          onChange={(e) => editing && setEditing({ ...editing, text: e.target.value })}
          onKeyDown={(e) => {
            if (!editing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(editing.text, { r: 1, c: 0 });
            } else if (e.key === 'Escape') {
              setEditing(null);
              gridRef.current?.focus({ preventScroll: true });
            }
          }}
          onBlur={() => editing?.from === 'bar' && commit(editing.text, null)}
          className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[13px] outline-none ${
            focusCell?.kind === 'formula' ? 'text-cyan-200' : 'text-white/85'
          } ${focusCell?.kind === 'input' ? 'focus:bg-white/[0.04]' : 'cursor-default'}`}
        />
      </div>

      {/* ── Phone layout ── */}
      <div className={mobileView === 'compact' ? 'sm:hidden' : 'hidden'}>
        {model ? (
          <MobileCalc sheet={sheet} focusAddr={focusAddr} refs={refs} flash={flash} selId={mobileSel} onTap={onMobileTap} />
        ) : (
          <MobileBenchmarks
            sheet={sheet}
            focusAddr={focusAddr}
            refs={refs}
            flash={flash}
            selId={mobileSel}
            onTap={onMobileTap}
            onLoad={onLoad}
            initialSide={lastModel}
          />
        )}
      </div>

      {/* ── Grid ── */}
      <div ref={scrollRef} className={`overflow-x-auto overscroll-x-contain ${mobileView === 'compact' ? 'max-sm:hidden' : ''}`}>
        <div
          ref={gridRef}
          role="grid"
          aria-label={model ? `${MODEL_LABEL[model]} ROAS calculator` : 'Benchmarks'}
          aria-rowcount={sheet.rows}
          aria-colcount={sheet.cols}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onCopy={(e) => !editing && copySelection(e)}
          onPaste={(e) => {
            if (editing) return;
            e.preventDefault();
            paste(e.clipboardData.getData('text/plain'));
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onDoubleClick={() => startEdit(focus, null)}
          className="relative select-none outline-none"
          style={{ width: totalW, minWidth: '100%' }}
        >
          {/* Column letters */}
          <div className="sticky top-0 z-20 flex" style={{ height: HEAD_H }}>
            <div className="sticky left-0 z-30 border-b border-r border-white/10 bg-[#0c1426]" style={{ width: NUM_W }} />
            {widths.map((w, c) => (
              <div
                key={c}
                className={`flex items-center justify-center border-b border-r border-white/10 text-[11px] font-bold transition-colors ${
                  c >= c0 && c <= c1 ? 'bg-cyan-400/10 text-cyan-200' : 'bg-[#0c1426] text-white/40'
                }`}
                style={{ width: w }}
              >
                {colName(c)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: sheet.rows }, (_, r) => (
            <div key={r} role="row" aria-rowindex={r + 1} className="flex" style={{ height: ROW_H }}>
              <div
                className={`sticky left-0 z-10 flex items-center justify-center border-b border-r border-white/10 text-[11px] font-bold transition-colors ${
                  r >= r0 && r <= r1 ? 'bg-[#11233a] text-cyan-200' : 'bg-[#0c1426] text-white/40'
                }`}
                style={{ width: NUM_W }}
              >
                {r + 1}
              </div>
              {widths.map((w, c) => (
                <div key={c} role="gridcell" aria-selected={r >= r0 && r <= r1 && c >= c0 && c <= c1} className="h-full">
                  <CellView cell={sheet.cells[addr(r, c)]} width={w} flash={flash} />
                </div>
              ))}
            </div>
          ))}

          {/* The cells the selected formula reads, outlined in colour. */}
          {refs.map((a, i) => {
            const p = parseAddr(a);
            if (!p) return null;
            const color = REF_COLORS[i % REF_COLORS.length];
            return (
              <motion.div
                key={`${focusAddr}-${a}`}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute z-[5] rounded-[3px]"
                style={{ ...rect(p.r, p.c, p.r, p.c), border: `2px dashed ${color}`, background: `${color}14` }}
              />
            );
          })}

          {/* Range fill */}
          {multi && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-[6] bg-cyan-400/[0.09]"
              style={rect(r0, c0, r1, c1)}
            />
          )}

          {/* The selection: a gradient outline that glides cell to cell. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute z-[7] rounded-[4px] p-[2px]"
            initial={false}
            animate={rect(focus.r, focus.c, focus.r, focus.c)}
            transition={{ type: 'spring', stiffness: 700, damping: 45, mass: 0.6 }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #22d3ee)',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              boxShadow: '0 0 18px rgba(34,211,238,0.35)',
            }}
          />

          {/* In-cell editor */}
          {editing && editRect && editing.from === 'cell' && (
            <input
              autoFocus
              aria-label={`Edit ${addr(editing.r, editing.c)}`}
              inputMode="decimal"
              value={editing.text}
              onFocus={(e) => {
                const n = e.target.value.length;
                e.target.setSelectionRange(n, n);
              }}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit(editing.text, { r: e.shiftKey ? -1 : 1, c: 0 });
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  commit(editing.text, { r: 0, c: e.shiftKey ? -1 : 1 });
                } else if (e.key === 'Escape') {
                  setEditing(null);
                  gridRef.current?.focus({ preventScroll: true });
                }
              }}
              onBlur={() => commit(editing.text, null)}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute z-[8] rounded-[4px] border-2 border-cyan-300 bg-[#0d1a2e] px-2.5 text-right font-mono text-sm font-bold text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] outline-none"
              style={editRect}
            />
          )}
        </div>
      </div>

      {/* ── Status bar + sheet tabs ── */}
      <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-black/20 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
        <div role="tablist" aria-label="Sheets" className="flex gap-1 overflow-x-auto max-sm:hidden">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => onTab(t.id)}
                className={`relative shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors sm:text-[13px] ${
                  on ? 'text-white' : 'text-white/50 hover:text-white/85'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId={tabPill}
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="min-h-[20px] px-1 text-[12px] text-white/55" aria-live="polite">
            {note ? (
              <motion.span
                key={note.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-1.5 font-semibold ${note.ok ? 'text-emerald-300' : 'text-amber-200'}`}
              >
                {note.ok && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {note.text}
              </motion.span>
            ) : stats ? (
              <motion.span key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-3 font-semibold tabular-nums">
                <Sigma className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                <span>Sum {fmtStat(stats.sum)}</span>
                <span>Average {fmtStat(stats.avg)}</span>
                <span>Count {stats.count}</span>
              </motion.span>
            ) : (
              <motion.span key={`hint-${focusAddr}-${tab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {focusCell?.explain ??
                  (model ? 'Blue cells are yours to change. Everything else is calculated.' : 'Select a block, then load it into a calculator.')}
              </motion.span>
            )}
        </div>
      </div>

      {portalReady &&
        createPortal(
          <EditorSheet
            open={editing?.from === 'sheet'}
            address={editing ? addr(editing.r, editing.c) : ''}
            title={editTitle}
            explain={editing ? sheet.cells[addr(editing.r, editing.c)]?.explain : undefined}
            cell={editing ? sheet.cells[addr(editing.r, editing.c)] : undefined}
            text={editing?.text ?? ''}
            onText={(t) => editing && setEditing({ ...editing, text: t })}
            onDone={() => editing && commit(editing.text, null)}
            onCancel={() => setEditing(null)}
            onStep={stepEdit}
            position={`${editPos} of ${inputOrder.length}`}
          />,
          document.body,
        )}
    </div>
  );
}
