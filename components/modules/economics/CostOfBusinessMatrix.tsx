"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Counter, Source, Tag, ease } from "@/components/ui";
import { META_FINES, META_FINES_TOTAL, META_NET_INCOME_2025, META_REVENUE_2025, daysOf, money, pct } from "./data";

type Base = "rev" | "ni";
const GRID = 100;
const CELL = 10;
const GAP = 2.2;
const SIZE = GRID * CELL;
/* each fine gets a slightly different crimson so adjacent blocks stay legible */
const SHADES = ["#ff3366", "#ff5c85", "#e0234f", "#ff8aa6", "#c81d47"];

export function CostOfBusinessMatrix() {
  const [base, setBase] = useState<Base>("rev");
  const [sel, setSel] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const baseAmt = base === "rev" ? META_REVENUE_2025 : META_NET_INCOME_2025;
  const perCell = baseAmt / (GRID * GRID);

  const blocks = useMemo(() => {
    let cursor = 0;
    return META_FINES.map((f, i) => {
      const n = Math.round(f.amount / perCell);
      let d = "";
      for (let k = cursor; k < cursor + n; k++) {
        const x = (k % GRID) * CELL;
        const y = Math.floor(k / GRID) * CELL;
        d += `M${x} ${y}h${CELL - GAP}v${CELL - GAP}h-${CELL - GAP}z`;
      }
      const startRow = Math.floor(cursor / GRID);
      cursor += n;
      return { ...f, n, d, shade: SHADES[i % SHADES.length], startRow, endRow: Math.ceil(cursor / GRID) };
    });
  }, [perCell]);

  const totalCells = blocks.reduce((a, b) => a + b.n, 0);
  const rows = Math.ceil(totalCells / GRID);
  const totalPct = pct(META_FINES_TOTAL, baseAmt);
  const totalDays = daysOf(META_FINES_TOTAL, baseAmt);
  const baseWord = base === "rev" ? "revenue" : "net income";
  const selFine = META_FINES.find((f) => f.id === sel);

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* ── waffle ── */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tag tone="crimson">10,000 cells = Meta 2025 {baseWord}</Tag>
          <div role="tablist" aria-label="Compare fines against" className="flex rounded-full border border-line-2 p-0.5">
            {(
              [
                ["rev", "Revenue"],
                ["ni", "Net income"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={base === k}
                onClick={() => setBase(k)}
                data-ghost={k === "ni" ? "switched to profit view → you're looking for the real number" : undefined}
                className={cn("relative rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em]", base === k ? "text-void" : "text-ink-2 hover:text-ink")}
              >
                {base === k && <motion.span layoutId="waffle-base" className="absolute inset-0 rounded-full bg-crimson" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-void/70 p-2.5 sm:p-4"
          data-ghost="10,000 squares of money · the red ones are the 'punishment'"
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full" role="img" aria-label={`Waffle chart: Meta's nine listed penalties, ${money(META_FINES_TOTAL)}, fill ${totalCells} of 10,000 cells representing 2025 ${baseWord} of ${money(baseAmt)}.`}>
            <defs>
              <pattern id="kyd-waffle" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
                <rect width={CELL - GAP} height={CELL - GAP} fill="rgba(255,255,255,0.075)" />
              </pattern>
              <clipPath id="kyd-waffle-reveal">
                <motion.rect
                  key={base}
                  x={0}
                  y={0}
                  width={SIZE}
                  initial={{ height: 0 }}
                  animate={{ height: inView ? rows * CELL : 0 }}
                  transition={{ duration: 1.4 + rows * 0.03, ease, delay: 0.2 }}
                />
              </clipPath>
            </defs>
            <rect width={SIZE} height={SIZE} fill="url(#kyd-waffle)" />
            <g clipPath="url(#kyd-waffle-reveal)">
              {blocks.map((b) => (
                <path
                  key={b.id}
                  d={b.d}
                  fill={b.shade}
                  opacity={sel && sel !== b.id ? 0.18 : 1}
                  style={{ transition: "opacity .3s", filter: sel === b.id ? "drop-shadow(0 0 6px #ff3366)" : undefined }}
                />
              ))}
            </g>
          </svg>
          {/* floating legend */}
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-line bg-void/85 px-3 py-2 text-right backdrop-blur sm:bottom-6 sm:right-6">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">1 cell ≈ {money(perCell)}</p>
            <p className="font-mono text-[11px] text-ink-2">
              grey = {baseWord} · <span className="text-crimson">red = all 9 fines</span>
            </p>
          </div>
        </div>
        <Source>
          Table 1, {"Sanka, Thakur & Nanda Salu"} (2026), amounts from Enzuzo [7]; Meta FY2025 revenue $200.97B, net income $60.46B [25].
          Percentages recomputed here. Dividing 2019–2024 fines by 2025 figures understates the burden at the time (FTC was ≈9% of 2018
          revenue). Excludes WhatsApp’s $255M and the EUR 200M DMA fine.
        </Source>
      </div>

      {/* ── ledger ── */}
      <div className="min-w-0">
        <div className="grid grid-cols-3 gap-3" data-ghost="aggregate exposure computed → still smaller than one quarter's ad growth">
          <BigStat label="9 penalties, 2019–25" value={<Counter to={META_FINES_TOTAL / 1000} decimals={2} prefix="$" suffix="B" />} />
          <BigStat label={`of one year’s ${baseWord}`} value={<motion.span key={base} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{totalPct.toFixed(1)}%</motion.span>} tone="crimson" />
          <BigStat label={`days of ${baseWord}`} value={<motion.span key={base} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{totalDays.toFixed(1)}</motion.span>} tone="amber" />
        </div>

        {/* proportional strip */}
        <div className="mt-6" data-ghost="the red sliver is the entire seven-year enforcement record">
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            <span>one year of {baseWord}</span>
            <span>{money(baseAmt, 2)}</span>
          </div>
          <div className="relative mt-2 h-6 overflow-hidden rounded-md bg-white/[0.07]">
            <motion.div
              className="absolute inset-y-0 left-0 bg-crimson"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${totalPct}%` : 0 }}
              transition={{ duration: 1.2, ease, delay: 0.4 }}
              style={{ boxShadow: "0 0 18px rgba(255,51,102,.6)" }}
            />
          </div>
        </div>

        <ul className="mt-6 divide-y divide-line border-y border-line" aria-label="Meta penalties">
          {blocks.map((b) => {
            const p = pct(b.amount, baseAmt);
            const on = sel === b.id;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel(b.id)}
                  onMouseEnter={() => setSel(b.id)}
                  onMouseLeave={() => setSel(null)}
                  onFocus={() => setSel(b.id)}
                  onBlur={() => setSel(null)}
                  data-ghost={b.ghost}
                  className={cn("w-full py-3.5 text-left transition-colors", on && "bg-crimson/[0.06]")}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: b.shade }} />
                      <span className="truncate text-[14px] text-ink">{b.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[13px] text-ink tabular-nums">{money(b.amount, 2)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: b.shade }}
                        initial={{ width: 0 }}
                        animate={{ width: inView ? `${p}%` : 0 }}
                        transition={{ duration: 0.9, ease, delay: 0.5 }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-[11px] text-crimson tabular-nums">{p.toFixed(p < 1 ? 2 : 1)}%</span>
                    <span className="w-20 shrink-0 text-right font-mono text-[11px] text-amber tabular-nums">{daysOf(b.amount, baseAmt).toFixed(1)} days</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 min-h-[64px] rounded-xl border border-line bg-void/60 p-3.5 text-[13px] leading-relaxed text-ink-2" aria-live="polite">
          {selFine ? (
            <>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">{selFine.year} · </span>
              {selFine.note}
            </>
          ) : (
            <span className="text-ink-3">Hover or tap a penalty to light up its cells.</span>
          )}
        </div>
        <p className="mt-3 font-mono text-[10.5px] tracking-wide text-ink-3">
          bar = share of one year’s {baseWord} · “days” = how long Meta takes to earn the fine ({money(baseAmt / 365)}/day)
        </p>
      </div>
    </div>
  );
}

function BigStat({ label, value, tone = "ink" }: { label: string; value: React.ReactNode; tone?: "ink" | "crimson" | "amber" }) {
  return (
    <div className="glass min-w-0 rounded-xl p-3 sm:p-4">
      <p className={cn("font-display text-[clamp(1.25rem,4.5vw,2.1rem)] font-extrabold leading-none tabular-nums", tone === "crimson" ? "text-crimson text-glow-crimson" : tone === "amber" ? "text-amber" : "text-ink")}>
        {value}
      </p>
      <p className="mt-2 font-mono text-[9.5px] uppercase leading-snug tracking-[0.14em] text-ink-3">{label}</p>
    </div>
  );
}
