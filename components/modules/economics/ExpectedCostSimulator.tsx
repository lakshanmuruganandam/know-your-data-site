"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Scale, Skull } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, Source, Tag, spring, toneText, type Tone } from "@/components/ui";
import { BreakEvenChart } from "./BreakEvenChart";
import { Odometer } from "./Odometer";
import { Slider } from "./Slider";
import { DEFAULT_STATE, PRESETS, discount, expectedPenalty, money, pctFmt, pvGain, type SimState } from "./data";

type Key = keyof SimState;

const TONES: Record<Key, Tone> = {
  pDetect: "cyan",
  pEnforce: "cyan",
  logFine: "amber",
  r: "lime",
  t: "lime",
  logRev: "crimson",
};

export function ExpectedCostSimulator() {
  const [s, setS] = useState<SimState>(DEFAULT_STATE);
  const [preset, setPreset] = useState<string | null>(PRESETS[0].id);
  const [active, setActive] = useState<Key | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const set = useCallback((k: Key, v: number) => {
    setS((p) => ({ ...p, [k]: v }));
    setPreset(null);
    setActive(k);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 1100);
  }, []);

  const fine = Math.pow(10, s.logFine);
  const rev = Math.pow(10, s.logRev);
  const d = discount(s.r, s.t);
  const E = expectedPenalty({ ...s, fine });
  const G = pvGain(rev, s.r, s.t);
  const net = G - E;
  const roi = E > 0 ? (net / E) * 100 : Infinity;
  const violate = net > 0;
  const pq = s.pDetect * s.pEnforce;
  const deterrent = pq > 0 ? G / (pq * d) : Infinity;
  const presetNote = useMemo(() => PRESETS.find((p) => p.id === preset)?.note, [preset]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ── LEFT: formula + sliders ── */}
      <Card hover={false} className="p-5 sm:p-7" ghost="opened compliance-cost model → segment: future auditor / journalist">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tag tone="amber">Expected-cost model</Tag>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Becker deterrence · discounted</span>
        </div>

        <Formula s={s} active={active} fine={fine} d={d} E={E} />

        {/* presets */}
        <div className="mt-6" data-ghost="clicked a preset → testing which laws are worth breaking">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Presets</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Scenario presets">
            {PRESETS.map((p) => (
              <motion.button
                key={p.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                aria-pressed={preset === p.id}
                onClick={() => {
                  setS(p.state);
                  setPreset(p.id);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                  preset === p.id ? "border-amber/60 bg-amber/10 text-amber" : "border-line-2 text-ink-2 hover:border-ink-3 hover:text-ink",
                )}
              >
                {p.label}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {presetNote && (
              <motion.p
                key={preset}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 border-l border-amber/40 pl-3 text-[13px] leading-relaxed text-ink-3"
              >
                {presetNote}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Slider
            symbol="P_d"
            label="P(detection)"
            value={s.pDetect}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("pDetect", v)}
            display={`${Math.round(s.pDetect * 100)}%`}
            tone={TONES.pDetect}
            active={active === "pDetect"}
            ghost="lowered P(detection) → interest: evasion · flag for legal-ops ads"
            hint="chance a regulator ever finds out"
          />
          <Slider
            symbol="P_e"
            label="P(enforcement)"
            value={s.pEnforce}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("pEnforce", v)}
            display={`${Math.round(s.pEnforce * 100)}%`}
            tone={TONES.pEnforce}
            active={active === "pEnforce"}
            ghost="appeal, annul, suspend → each one shaves this number"
            hint="chance the fine survives appeal and is paid"
          />
          <Slider
            symbol="F"
            label="Fine magnitude"
            value={s.logFine}
            min={0}
            max={5}
            step={0.01}
            onChange={(v) => set("logFine", v)}
            display={money(fine)}
            valueText={`${money(fine)} US dollars`}
            tone={TONES.logFine}
            active={active === "logFine"}
            ghost="log scale · $1M → $100B · the range of regulator imagination"
            hint="log scale · $1M → $100B"
          />
          <Slider
            symbol="r"
            label="Discount rate"
            value={s.r}
            min={0}
            max={0.25}
            step={0.005}
            onChange={(v) => set("r", v)}
            display={`${(s.r * 100).toFixed(1)}%`}
            tone={TONES.r}
            active={active === "r"}
            ghost="cost of capital → a fine tomorrow is cheaper than a fine today"
            hint="cost of capital — money later is worth less"
          />
          <Slider
            symbol="t"
            label="Years until penalty"
            value={s.t}
            min={0}
            max={15}
            step={0.5}
            onChange={(v) => set("t", v)}
            display={`${s.t.toFixed(1)} yr`}
            valueText={`${s.t} years`}
            tone={TONES.t}
            active={active === "t"}
            ghost="investigation + appeal = years of free cash flow"
            hint="investigations and appeals take years"
          />
          <Slider
            symbol="R"
            label="Tracking revenue / yr"
            value={s.logRev}
            min={-1}
            max={5}
            step={0.01}
            onChange={(v) => set("logRev", v)}
            display={money(rev)}
            valueText={`${money(rev)} US dollars per year`}
            tone={TONES.logRev}
            active={active === "logRev"}
            ghost="R = what your profile is worth to them, per year, at scale"
            hint="log scale · $100K → $100B per year"
          />
        </div>
      </Card>

      {/* ── RIGHT: outputs, verdict, chart ── */}
      <div className="flex min-w-0 flex-col gap-6">
        <Verdict violate={violate} />

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Discounted expected penalty" value={money(E)} tone="amber" ghost="the number the CFO actually budgets for" />
          <Stat label="PV of tracking gain (until penalty)" value={money(G)} tone="crimson" ghost="gain = R earned every year the case drags on" />
          <Stat
            label="Net profit of violating"
            value={money(net)}
            tone={violate ? "crimson" : "lime"}
            ghost={violate ? "net > 0 → keep collecting" : "net < 0 → quietly comply (this time)"}
          />
          <Stat
            label="ROI of breaking the law"
            value={pctFmt(roi)}
            tone={violate ? "crimson" : "lime"}
            ghost="roi computed on the expected fine, like any other operating cost"
          />
        </div>

        <Card hover={false} className="p-4 sm:p-5" ghost="break-even computed → you now think like a compliance strategist">
          <BreakEvenChart s={s} fine={fine} rev={rev} />
        </Card>

        <div className="rounded-xl border border-line bg-void/60 p-4 text-[13px] leading-relaxed text-ink-2" data-ghost="read the becker threshold → segment: policy-curious">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Becker threshold · </span>
          to deter, the nominal fine must exceed gain ÷ (P<sub>d</sub>·P<sub>e</sub>·discount) ≈{" "}
          <span className="font-mono text-amber">{isFinite(deterrent) ? money(deterrent) : "∞ (nobody is watching)"}</span>
          {isFinite(deterrent) && (
            <>
              {" "}
              — that is <span className="font-mono text-ink">{(deterrent / fine).toLocaleString("en-US", { maximumFractionDigits: deterrent / fine >= 10 ? 0 : 1 })}×</span> the fine on the slider.
            </>
          )}
        </div>
        <Source>
          Model from §4.1 of {"Sanka, Thakur & Nanda Salu"} (2026): a penalty deters only if it exceeds the gain divided by the probability of
          enforcement (Becker). Gain here = present value of R earned until the penalty lands. Illustrative — not a valuation of any company.
        </Source>
      </div>
    </div>
  );
}

/* ───────── the formula, rendered in HTML/CSS ───────── */

function Formula({ s, active, fine, d, E }: { s: SimState; active: Key | null; fine: number; d: number; E: number }) {
  return (
    <div
      className="mt-6 overflow-hidden rounded-xl border border-line bg-void/70 px-3 py-5 sm:px-5"
      data-ghost="stared at the formula → the formula is the business model"
      aria-label={`Expected penalty equals P detection ${Math.round(s.pDetect * 100)} percent times P enforcement ${Math.round(
        s.pEnforce * 100,
      )} percent times fine ${money(fine)} times one over one plus r to the t, equals ${money(E)}`}
      role="img"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 font-serif text-[22px] leading-none text-ink sm:text-[28px]">
        <Glyph i={0}>
          <span className="whitespace-nowrap italic text-ink-2">
            E<span className="font-sans text-[0.6em] not-italic">[penalty]</span>
          </span>
        </Glyph>
        <Glyph i={1}><Op>=</Op></Glyph>
        <Glyph i={2}>
          <Term tone="cyan" on={active === "pDetect"} sub={`${Math.round(s.pDetect * 100)}%`}>
            P<span className="text-[0.55em] align-sub not-italic">d</span>
          </Term>
        </Glyph>
        <Glyph i={3}><Op>×</Op></Glyph>
        <Glyph i={4}>
          <Term tone="cyan" on={active === "pEnforce"} sub={`${Math.round(s.pEnforce * 100)}%`}>
            P<span className="text-[0.55em] align-sub not-italic">e</span>
          </Term>
        </Glyph>
        <Glyph i={5}><Op>×</Op></Glyph>
        <Glyph i={6}>
          <Term tone="amber" on={active === "logFine"} sub={money(fine)}>
            F
          </Term>
        </Glyph>
        <Glyph i={7}><Op>×</Op></Glyph>
        <Glyph i={8}>
          <Term tone="lime" on={active === "r" || active === "t"} sub={`×${d.toFixed(2)}`}>
            <span className="inline-flex flex-col items-center px-0.5 align-middle">
              <span className="px-2 pb-1 not-italic">1</span>
              <span className="h-px w-full bg-current opacity-60" />
              <span className="whitespace-nowrap px-1 pt-1">
                (1 + <Hi on={active === "r"}>r</Hi>)<sup className="ml-0.5 text-[0.6em]"><Hi on={active === "t"}>t</Hi></sup>
              </span>
            </span>
          </Term>
        </Glyph>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 border-t border-line pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">=</span>
        <Odometer value={money(E)} className="font-mono text-2xl text-amber tabular-nums sm:text-3xl" />
      </div>
    </div>
  );
}

/* formula assembles from scattered glyphs when it scrolls into view (fixed offsets → SSR-stable) */
const SCATTER = [
  { x: -90, y: -40, r: -28 },
  { x: -30, y: 60, r: 40 },
  { x: 40, y: -70, r: 18 },
  { x: -60, y: 50, r: -50 },
  { x: 80, y: 40, r: 26 },
  { x: 20, y: -60, r: -36 },
  { x: -50, y: -50, r: 32 },
  { x: 70, y: 70, r: -22 },
  { x: 110, y: -30, r: 14 },
];

function Glyph({ i, children }: { i: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const o = SCATTER[i % SCATTER.length];
  return (
    <motion.span
      className="inline-flex"
      initial={{ x: o.x, y: o.y, rotate: o.r, opacity: 0, filter: "blur(8px)" }}
      whileInView={{ x: 0, y: 0, rotate: 0, opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -3% 0px" }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 15, delay: 0.1 + i * 0.07 }}
    >
      {children}
    </motion.span>
  );
}

function Op({ children }: { children: ReactNode }) {
  return <span className="px-0.5 font-sans text-[0.7em] text-ink-3">{children}</span>;
}

function Hi({ on, children }: { on: boolean; children: ReactNode }) {
  return <span className={cn("transition-[color,text-shadow] duration-300", on && "text-white [text-shadow:0_0_12px_currentColor]")}>{children}</span>;
}

function Term({ tone, on, sub, children }: { tone: Tone; on: boolean; sub: string; children: ReactNode }) {
  const color = `var(--${tone === "ink" ? "ink-2" : tone})`;
  return (
    <motion.span
      animate={{
        boxShadow: on ? `0 0 0 1px ${color}, 0 0 28px -4px ${color}` : "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 0 rgba(0,0,0,0)",
        y: on ? -3 : 0,
      }}
      transition={spring}
      className={cn("relative inline-flex flex-col items-center rounded-lg px-2 pb-1.5 pt-2 italic", toneText[tone])}
    >
      <span className={cn("transition-[text-shadow] duration-300", on && "[text-shadow:0_0_14px_currentColor]")}>{children}</span>
      <span className="mt-1.5 font-mono text-[10px] not-italic tracking-wide text-ink-2 tabular-nums">{sub}</span>
    </motion.span>
  );
}

function Stat({ label, value, tone, ghost }: { label: string; value: string; tone: Tone; ghost: string }) {
  return (
    <div data-ghost={ghost} className="glass min-w-0 rounded-xl p-3.5 sm:p-4">
      <p className="font-mono text-[9.5px] uppercase leading-snug tracking-[0.16em] text-ink-3 sm:text-[10px]">{label}</p>
      <p className={cn("mt-2 truncate font-mono text-xl tabular-nums sm:text-2xl", toneText[tone])}>
        <Odometer value={value} />
      </p>
    </div>
  );
}

function Verdict({ violate }: { violate: boolean }) {
  const reduce = useReducedMotion();
  const siren = violate ? "rgba(255,51,102,.55)" : "rgba(0,255,136,.45)";
  return (
    <div aria-live="polite" className="relative [perspective:900px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={violate ? "v" : "c"}
          /* split-flap flip on the X axis when the verdict changes */
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -88, filter: "blur(4px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotateX: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 88, filter: "blur(4px)" }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 22 }}
          style={{ originY: 0.5 }}
          data-ghost={violate ? "verdict: violate · board approves · fine reserved as opex" : "verdict: comply · rare outcome · log for analysts"}
          className={cn(
            "scanlines relative overflow-hidden rounded-2xl border px-5 py-5 sm:px-6",
            violate ? "border-crimson/50 bg-crimson/10" : "border-lime/50 bg-lime/10",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 opacity-60 blur-2xl"
            style={{ background: `radial-gradient(circle at 20% 50%, ${violate ? "rgba(255,51,102,.35)" : "rgba(0,255,136,.3)"}, transparent 60%)` }}
          />
          {/* siren sweep: a beam of light crosses the banner twice as the new verdict lands */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 mix-blend-screen"
              style={{ background: `linear-gradient(100deg, transparent 10%, ${siren} 50%, transparent 90%)` }}
              initial={{ x: "-120%" }}
              animate={{ x: "260%" }}
              transition={{ duration: 0.75, repeat: 1, ease: "easeInOut", delay: 0.12 }}
            />
          )}
          <div className="relative flex items-center gap-4">
            {violate ? <Skull className="shrink-0 text-crimson" size={30} /> : <Scale className="shrink-0 text-lime" size={30} />}
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-2">Verdict</p>
              <p
                className={cn(
                  "font-display text-[clamp(1.25rem,4.4vw,2rem)] font-extrabold leading-tight tracking-tight",
                  violate ? "text-crimson text-glow-crimson" : "text-lime text-glow-lime",
                )}
              >
                {violate ? "VIOLATION IS RATIONAL" : "COMPLIANCE IS RATIONAL"}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
