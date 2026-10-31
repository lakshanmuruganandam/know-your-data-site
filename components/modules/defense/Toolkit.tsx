"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, RotateCcw, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Source, Tag, ease, spring } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useShadow } from "@/lib/shadow";
import { TOOLKIT, TOTAL_MIN, type Step } from "./data";

const KEY = "kyd.toolkit.checked.v1";
const OPEN_KEY = "kyd.toolkit.open.v1";
const CLOCK_SECONDS = 90 * 60;

type Toast = { id: number; from: number; to: number; fields: string[] };
/** a redaction pulse fired from the task(s) just checked */
type Pulse = { id: number; keys: string[]; drop: number };

const fmtClock = (s: number) => {
  const v = Math.max(0, Math.round(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
};

export function Toolkit() {
  const { fields, redacted, redact, restore, price } = useShadow();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>("accounts");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  /* timeline rail draws itself as the steps scroll through the viewport */
  const railRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 85%", "end 70%"] });
  const railDraw = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const railTop = useTransform(railDraw, (v) => `calc(1.5rem + (100% - 3rem) * ${v.toFixed(4)} - 4rem)`);
  const railHeadO = useTransform(railDraw, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    },
    [],
  );

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChecked(new Set(JSON.parse(raw) as string[]));
      const o = localStorage.getItem(OPEN_KEY);
      if (o) setOpen(o === "none" ? null : o);
    } catch {}
  }, []);

  const save = (s: Set<string>) => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...s]));
    } catch {}
  };

  const setOpenPersist = (id: string | null) => {
    setOpen(id);
    try {
      localStorage.setItem(OPEN_KEY, id ?? "none");
    } catch {}
  };

  /** which field ids are still claimed by some other checked task */
  const claimed = useCallback((set: Set<string>) => {
    const c = new Set<string>();
    for (const s of TOOLKIT) for (const t of s.tasks) if (set.has(`${s.id}.${t.id}`)) t.redacts?.forEach((r) => c.add(r));
    return c;
  }, []);

  const showToast = (ids: string[]) => {
    const live = fields.filter((f) => ids.includes(f.id) && !redacted.has(f.id));
    if (!live.length) return;
    const drop = live.reduce((a, f) => a + f.cpm, 0);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), from: price, to: Math.max(0, price - drop), fields: live.map((f) => f.label) });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };

  const applyChange = (keys: string[], on: boolean) => {
    const next = new Set(checked);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    const ids = new Set<string>();
    for (const s of TOOLKIT) for (const t of s.tasks) if (keys.includes(`${s.id}.${t.id}`)) t.redacts?.forEach((r) => ids.add(r));
    if (on) {
      const drop = fields.filter((f) => ids.has(f.id) && !redacted.has(f.id)).reduce((a, f) => a + f.cpm, 0);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      setPulse({ id: Date.now(), keys, drop });
      pulseTimer.current = setTimeout(() => setPulse(null), 1700);
      showToast([...ids]);
      ids.forEach(redact);
    } else {
      const still = claimed(next);
      ids.forEach((id) => !still.has(id) && restore(id));
    }
    setChecked(next);
    save(next);
  };

  const toggleTask = (step: Step, taskId: string) => {
    const k = `${step.id}.${taskId}`;
    applyChange([k], !checked.has(k));
  };

  const toggleStep = (step: Step) => {
    const keys = step.tasks.map((t) => `${step.id}.${t.id}`);
    const all = keys.every((k) => checked.has(k));
    applyChange(keys, !all);
  };

  const reset = () => {
    const ids = claimed(checked);
    ids.forEach(restore);
    const empty = new Set<string>();
    setChecked(empty);
    save(empty);
    setToast(null);
  };

  const progress = useMemo(() => {
    let doneMin = 0;
    let stepsDone = 0;
    let tasksDone = 0;
    let tasksTotal = 0;
    for (const s of TOOLKIT) {
      const d = s.tasks.filter((t) => checked.has(`${s.id}.${t.id}`)).length;
      tasksDone += d;
      tasksTotal += s.tasks.length;
      doneMin += (d / s.tasks.length) * s.minutes;
      if (d === s.tasks.length) stepsDone++;
    }
    const frac = doneMin / TOTAL_MIN;
    return { frac, stepsDone, tasksDone, tasksTotal, remaining: CLOCK_SECONDS * (1 - frac) };
  }, [checked]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
      {/* ── Mission clock ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <MissionClock {...progress} price={price} onReset={reset} />
      </div>

      {/* ── Timeline rail ── */}
      <ol ref={railRef} className="relative min-w-0" aria-label="90-minute toolkit steps">
        <motion.div aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-line-2" style={{ scaleY: reduce ? 1 : railDraw }} />
        {/* scroll-drawn rail head: a cyan spark riding the tip of the rail */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[19px] h-16 w-px bg-gradient-to-b from-transparent to-cyan"
            style={{ top: railTop, opacity: railHeadO, boxShadow: "0 0 10px var(--cyan)" }}
          />
        )}
        <motion.div
          aria-hidden
          className="absolute left-[19px] top-6 w-px origin-top bg-gradient-to-b from-lime via-cyan to-lime shadow-[0_0_12px_var(--lime)]"
          style={{ height: "calc(100% - 3rem)" }}
          initial={false}
          animate={{ scaleY: progress.frac }}
          transition={spring}
        />
        {TOOLKIT.map((s) => (
          <StepRow
            key={s.id}
            step={s}
            open={open === s.id}
            onOpen={() => setOpenPersist(open === s.id ? null : s.id)}
            checked={checked}
            onTask={(t) => toggleTask(s, t)}
            onStep={() => toggleStep(s)}
            pulse={pulse}
          />
        ))}
      </ol>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={spring}
            className="fixed inset-x-0 bottom-5 z-[60] mx-auto w-[min(92vw,420px)]"
          >
            <div className="glass ticks rounded-2xl border border-lime/40 p-4 shadow-[0_0_40px_-10px_var(--lime)]">
              <div className="flex items-start gap-3">
                <TrendingDown className="mt-0.5 shrink-0 text-lime" size={20} />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">Shadow profile redacted</p>
                  <p className="mt-1 text-sm text-ink">
                    Your auction price dropped from{" "}
                    <span className="font-mono text-crimson line-through decoration-crimson/60">${toast.from.toFixed(2)}</span> to{" "}
                    <span className="font-mono text-lime">${toast.to.toFixed(2)}</span> CPM.
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-ink-3">− {toast.fields.join(" · ")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MissionClock({
  frac,
  stepsDone,
  tasksDone,
  tasksTotal,
  remaining,
  price,
  onReset,
}: {
  frac: number;
  stepsDone: number;
  tasksDone: number;
  tasksTotal: number;
  remaining: number;
  price: number;
  onReset: () => void;
}) {
  const mv = useMotionValue(remaining);
  const text = useTransform(mv, fmtClock);
  useEffect(() => {
    const c = animate(mv, remaining, { duration: 1.1, ease });
    return () => c.stop();
  }, [remaining, mv]);

  const R = 70;
  const C = 2 * Math.PI * R;
  const done = frac >= 0.999;

  return (
    <Card
      hover={false}
      ghost={done ? "all 7 moves complete → profile value collapsing · re-target failed" : "toolkit incomplete → you remain a premium impression"}
      className="ticks relative overflow-hidden p-5 sm:p-6"
    >
      <div className={cn("pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl", done ? "bg-lime/20" : "bg-cyan/10")} />
      <div className="flex items-center justify-between">
        <Tag tone={done ? "lime" : "cyan"}>{done ? "Mission complete" : "T-minus"}</Tag>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3 transition-colors hover:text-crimson focus-visible:outline focus-visible:outline-1 focus-visible:outline-crimson"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="relative mx-auto mt-4 grid aspect-square w-full max-w-[220px] place-items-center">
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--line-2)" strokeWidth="3" />
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r1 = i % 5 === 0 ? 76 : 78;
            return (
              <line
                key={i}
                x1={(Math.round((80 + Math.cos(a) * r1) * 100) / 100)}
                y1={(Math.round((80 + Math.sin(a) * r1) * 100) / 100)}
                x2={(Math.round((80 + Math.cos(a) * 80) * 100) / 100)}
                y2={(Math.round((80 + Math.sin(a) * 80) * 100) / 100)}
                stroke={i / 60 < frac ? "var(--lime)" : "var(--line-2)"}
                strokeWidth="1"
              />
            );
          })}
          <motion.circle
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke={done ? "var(--lime)" : "var(--cyan)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - frac) }}
            transition={spring}
            style={{ filter: `drop-shadow(0 0 6px ${done ? "var(--lime)" : "var(--cyan)"})` }}
          />
        </svg>
        <div className="text-center">
          <motion.div
            className={cn("font-mono text-[2.6rem] font-semibold tabular-nums leading-none sm:text-5xl", done ? "text-lime text-glow-lime" : "text-ink")}
            aria-label={`${fmtClock(remaining)} remaining`}
          >
            {text}
          </motion.div>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">of 90:00 left</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Steps</dt>
          <dd className="mt-1 font-mono text-lg text-ink">
            {stepsDone}
            <span className="text-ink-3">/7</span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Tasks</dt>
          <dd className="mt-1 font-mono text-lg text-ink">
            {tasksDone}
            <span className="text-ink-3">/{tasksTotal}</span>
          </dd>
        </div>
        <div data-ghost="your live bid price — falls as fields go dark">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Your CPM</dt>
          <dd className={cn("mt-1 font-mono text-lg", price < 1 ? "text-lime" : "text-crimson")}>${price.toFixed(2)}</dd>
        </div>
      </dl>
      <Source>Toolkit: L. Muruganandam, Know Your Data dossier §2 (7 moves, ~90 min, all free). Step sum 88 min. CPM is illustrative.</Source>
    </Card>
  );
}

function StepRow({
  step,
  open,
  onOpen,
  checked,
  onTask,
  onStep,
  pulse,
}: {
  step: Step;
  open: boolean;
  onOpen: () => void;
  checked: Set<string>;
  onTask: (id: string) => void;
  onStep: () => void;
  pulse: Pulse | null;
}) {
  const reduce = useReducedMotion();
  const done = step.tasks.filter((t) => checked.has(`${step.id}.${t.id}`)).length;
  const complete = done === step.tasks.length;
  const partial = done > 0 && !complete;
  const panelId = `step-panel-${step.id}`;

  return (
    <li className="relative pb-4 pl-12 sm:pl-14" data-ghost={step.ghost}>
      {/* node */}
      <button
        type="button"
        onClick={onStep}
        aria-label={complete ? `Mark step ${step.n} incomplete` : `Mark all of step ${step.n} done`}
        aria-pressed={complete}
        className={cn(
          "absolute left-0 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
          complete
            ? "border-lime bg-lime text-void shadow-[0_0_18px_var(--lime)]"
            : partial
              ? "border-cyan bg-carbon text-cyan"
              : "border-line-2 bg-carbon text-ink-2 hover:border-cyan/60",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {complete ? (
            <motion.svg key="c" viewBox="0 0 24 24" width="18" height="18" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}>
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
            </motion.svg>
          ) : (
            <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              {String(step.n).padStart(2, "0")}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className={cn("glass overflow-hidden rounded-2xl border transition-colors", complete ? "border-lime/30" : open ? "border-cyan/30" : "border-transparent")}>
        <button
          type="button"
          onClick={onOpen}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-cyan sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.2em]">
              <span className="text-ink-3">Step {step.n}</span>
              <span className={complete ? "text-lime" : "text-cyan"}>{step.minutes} min</span>
              <span className="text-ink-3">
                {done}/{step.tasks.length}
              </span>
            </div>
            <h3 className={cn("mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl", complete && "text-ink-2")}>
              {step.title}{" "}
              <span className={cn("font-serif font-normal italic tracking-normal", complete ? "text-lime" : "text-cyan")}>{step.accent}</span>
            </h3>
            <p className="mt-1 text-sm text-ink-2">{step.why}</p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="mt-1 shrink-0 text-ink-3">
            <ChevronDown size={18} />
          </motion.span>
        </button>

        {/* mini progress */}
        <div className="h-px w-full bg-line">
          <motion.div className={cn("h-px", complete ? "bg-lime" : "bg-cyan")} initial={false} animate={{ width: `${(done / step.tasks.length) * 100}%` }} transition={spring} />
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 p-3 sm:p-4">
                {step.tasks.map((t) => {
                  const k = `${step.id}.${t.id}`;
                  const on = checked.has(k);
                  const firing = !reduce && pulse && pulse.keys.includes(k);
                  return (
                    <li key={t.id} data-ghost={t.ghost} className="relative">
                      {firing && <RedactionPulse key={pulse.id} drop={pulse.keys[0] === k ? pulse.drop : 0} />}
                      <label
                        className={cn(
                          "group relative flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-cyan",
                          on ? "border-lime/25 bg-lime/[0.04]" : "border-line hover:border-line-2 hover:bg-white/[0.02]",
                        )}
                      >
                        <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onTask(t.id)} />
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                            on ? "border-lime bg-lime text-void" : "border-line-2 group-hover:border-cyan/60",
                          )}
                        >
                          {on && (
                            <motion.svg viewBox="0 0 24 24" width="14" height="14" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
                              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[15px] leading-snug", on ? "text-ink-2 line-through decoration-lime/50" : "text-ink")}>{t.text}</span>
                          <span className="mt-1 block text-[13px] leading-relaxed text-ink-3">{t.how}</span>
                          {t.redacts && (
                            <span className="mt-2 flex flex-wrap gap-1.5">
                              {t.redacts.map((r) => (
                                <span
                                  key={r}
                                  className={cn(
                                    "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                                    on ? "border-lime/30 text-lime" : "border-crimson/30 text-crimson/80",
                                  )}
                                >
                                  {on ? "█ " : "▸ "}
                                  {r}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {step.link && (
                <div className="flex flex-wrap items-center gap-3 border-t border-line p-4">
                  <Button href={step.link.href} tone="lime">
                    {step.link.label} <ArrowRight size={14} />
                  </Button>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">Templates B &amp; C · PDPL Arts. 13–18</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

/* fired when a task is checked: a cyan ripple bursts from the checkbox, a redaction bar wipes the row,
   and the CPM it just cost the ad market floats up as a ghost */
function RedactionPulse({ drop }: { drop: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.span
          className="absolute left-[22px] top-[22px] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan"
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 14, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-cyan/25 via-cyan/10 to-transparent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      {drop > 0 && (
        <motion.span
          className="absolute right-3 top-2 font-mono text-[12px] font-semibold text-cyan text-glow-cyan"
          initial={{ y: 4, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: -34, opacity: [0, 1, 1, 0], filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut", opacity: { duration: 1.5, times: [0, 0.15, 0.6, 1] } }}
        >
          −${drop.toFixed(2)} CPM
        </motion.span>
      )}
    </span>
  );
}
