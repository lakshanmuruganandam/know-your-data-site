"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ease } from "@/components/ui";
import { discount, expectedPenalty, money, pvGain, type SimState } from "./data";

type Mode = "p" | "t";

const W = 400;
const H = 240;
const PAD = { l: 50, r: 12, t: 14, b: 30 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;
const N = 60;

export function BreakEvenChart({ s, fine, rev }: { s: SimState; fine: number; rev: number }) {
  const [mode, setMode] = useState<Mode>("p");

  const m = useMemo(() => {
    const xMax = mode === "p" ? 1 : 15;
    const E = (x: number) =>
      mode === "p" ? expectedPenalty({ ...s, pDetect: x, fine }) : expectedPenalty({ ...s, t: x, fine });
    const G = (x: number) => (mode === "p" ? pvGain(rev, s.r, s.t) : pvGain(rev, s.r, x));
    const xs = Array.from({ length: N + 1 }, (_, i) => (i / N) * xMax);
    const es = xs.map(E);
    const gs = xs.map(G);
    const yMax = Math.max(...es, ...gs, 1e-9) * 1.12;
    const sx = (x: number) => PAD.l + (x / xMax) * IW;
    const sy = (y: number) => PAD.t + IH - (y / yMax) * IH;
    const path = (ys: number[]) => ys.map((y, i) => `${i ? "L" : "M"}${sx(xs[i]).toFixed(2)},${sy(y).toFixed(2)}`).join(" ");

    // break-even
    let be: number | null = null;
    if (mode === "p") {
      const denom = s.pEnforce * fine * discount(s.r, s.t);
      const p = denom > 0 ? G(0) / denom : Infinity;
      if (p >= 0 && p <= 1) be = p;
    } else {
      const fine2 = 400;
      let prev = G(0) - E(0);
      for (let i = 1; i <= fine2; i++) {
        const x = (i / fine2) * xMax;
        const cur = G(x) - E(x);
        if ((prev <= 0 && cur > 0) || (prev > 0 && cur <= 0)) {
          const x0 = ((i - 1) / fine2) * xMax;
          be = x0 + (xMax / fine2) * (Math.abs(prev) / (Math.abs(prev) + Math.abs(cur)));
          break;
        }
        prev = cur;
      }
    }

    // shaded regions where violating pays (G > E)
    const regions: { x0: number; x1: number; violate: boolean }[] = [];
    const R = 240;
    let start = 0;
    let state = G(0) > E(0);
    for (let i = 1; i <= R; i++) {
      const x = (i / R) * xMax;
      const st = G(x) > E(x);
      if (st !== state || i === R) {
        regions.push({ x0: start, x1: x, violate: state });
        start = x;
        state = st;
      }
    }

    const cur = mode === "p" ? s.pDetect : s.t;
    return {
      xMax,
      sx,
      sy,
      yMax,
      ePath: path(es),
      gPath: path(gs),
      be,
      beY: be !== null ? E(be) : 0,
      regions,
      cur,
      curE: E(cur),
      curG: G(cur),
    };
  }, [mode, s, fine, rev]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * (m.yMax / 1.12));
  const xTicks = mode === "p" ? [0, 0.25, 0.5, 0.75, 1] : [0, 3, 6, 9, 12, 15];
  const fmtX = (x: number) => (mode === "p" ? `${Math.round(x * 100)}%` : `${x}y`);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Penalty vs gain</p>
        <div role="tablist" aria-label="Chart x-axis" className="flex rounded-full border border-line-2 p-0.5">
          {(["p", "t"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={mode === k}
              type="button"
              onClick={() => setMode(k)}
              className={cn("relative rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors", mode === k ? "text-void" : "text-ink-2 hover:text-ink")}
            >
              {mode === k && <motion.span layoutId="be-tab" className="absolute inset-0 rounded-full bg-cyan" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{k === "p" ? "across P(detect)" : "across years t"}</span>
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={
          m.be !== null
            ? `Break-even at ${mode === "p" ? `${Math.round(m.be * 100)} percent detection probability` : `${m.be.toFixed(1)} years`}`
            : "No break-even point in this range"
        }
      >
        {/* regions */}
        {m.regions.map((r, i) => (
          <rect
            key={`${mode}-${i}`}
            x={m.sx(r.x0)}
            y={PAD.t}
            width={Math.max(0, m.sx(r.x1) - m.sx(r.x0))}
            height={IH}
            fill={r.violate ? "var(--crimson)" : "var(--lime)"}
            opacity={r.violate ? 0.08 : 0.06}
          />
        ))}
        {/* grid */}
        {yTicks.map((y, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={m.sy(y)} y2={m.sy(y)} stroke="var(--line)" />
            <text x={PAD.l - 6} y={m.sy(y) + 3.5} textAnchor="end" className="fill-ink-3 font-mono" fontSize="10">
              {money(y, 0)}
            </text>
          </g>
        ))}
        {xTicks.map((x) => (
          <text key={`${mode}${x}`} x={m.sx(x)} y={H - 10} textAnchor="middle" className="fill-ink-3 font-mono" fontSize="10">
            {fmtX(x)}
          </text>
        ))}

        {/* curves */}
        <motion.path d={m.gPath} animate={{ d: m.gPath }} transition={{ duration: 0.45, ease }} fill="none" stroke="var(--crimson)" strokeWidth="2.2" />
        <motion.path d={m.ePath} animate={{ d: m.ePath }} transition={{ duration: 0.45, ease }} fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeDasharray="5 4" />

        {/* current value */}
        <motion.g animate={{ x: m.sx(Math.min(m.cur, m.xMax)) }} transition={{ duration: 0.3, ease }}>
          <line x1={0} x2={0} y1={PAD.t} y2={PAD.t + IH} stroke="var(--cyan)" strokeOpacity="0.5" strokeDasharray="2 3" />
        </motion.g>
        <motion.circle r="3.5" fill="var(--crimson)" animate={{ cx: m.sx(Math.min(m.cur, m.xMax)), cy: m.sy(m.curG) }} transition={{ duration: 0.3, ease }} />
        <motion.circle r="3.5" fill="var(--amber)" animate={{ cx: m.sx(Math.min(m.cur, m.xMax)), cy: m.sy(m.curE) }} transition={{ duration: 0.3, ease }} />

        {/* break-even */}
        {m.be !== null && (
          <motion.g key={mode} initial={{ opacity: 0, scale: 0.4, x: m.sx(m.be), y: m.sy(m.beY) }} animate={{ opacity: 1, scale: 1, x: m.sx(m.be), y: m.sy(m.beY) }} transition={{ duration: 0.45, ease }}>
            <motion.circle r="6" fill="none" stroke="var(--ink)" strokeWidth="1.2" animate={{ r: [6, 14], opacity: [0.9, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }} />
            <circle r="4.5" fill="var(--void)" stroke="var(--ink)" strokeWidth="2" />
            <text x={m.sx(m.be) > W - 120 ? -10 : 10} y={-10} textAnchor={m.sx(m.be) > W - 120 ? "end" : "start"} className="fill-ink font-mono" fontSize="10.5">
              break-even {mode === "p" ? `${Math.round(m.be * 100)}%` : `${m.be.toFixed(1)}y`}
            </text>
          </motion.g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-2">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-crimson" /> tracking gain (PV)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-amber" /> expected penalty</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-crimson/30" /> violating pays</span>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
        {mode === "p"
          ? m.be !== null
            ? <>Below <span className="font-mono text-ink">{Math.round(m.be * 100)}%</span> chance of detection, breaking the law is the profitable choice.</>
            : <>No detection probability makes compliance pay here — even <span className="text-crimson">certain detection</span> leaves violating profitable.</>
          : m.be !== null
            ? <>If the penalty lands later than <span className="font-mono text-ink">{m.be.toFixed(1)} years</span>, the tracking gain outruns it.</>
            : <>No crossover within 15 years at these settings.</>}
      </p>
    </div>
  );
}
