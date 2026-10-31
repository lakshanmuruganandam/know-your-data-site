"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useSeg } from "./hooks";
import { CHAPTERS, PROLOGUE, TC_MS, TC_STOPS, toneText, toneVar, type Chapter, type Packet } from "./model";
import { SceneAuction, SceneBreach, SceneBroker, SceneClick, ScenePixel, SceneShield } from "./Scenes";

type MV = MotionValue<number>;
const D = 0.018;

export const SCENES = {
  click: SceneClick,
  pixel: ScenePixel,
  auction: SceneAuction,
  broker: SceneBroker,
  breach: SceneBreach,
  shield: SceneShield,
} as const;

export function chapterTc(c: Chapter) {
  if (c.id === "breach") return "T + years";
  if (c.id === "shield") return "200 ms · reversed";
  const i = TC_STOPS.indexOf(c.a);
  return `${String(TC_MS[i] ?? 0).padStart(3, "0")} ms`;
}

/* ── one camera shot: cross-fade + dolly in, push-through or pull-back out ── */
function Shot({ p, c, last, packets, price }: { p: MV; c: Chapter; last: boolean; packets: Packet[]; price: number }) {
  const t = useSeg(p, c.a, c.b);
  const inR = [c.a - D, c.a + D];
  const range = last ? inR : [...inR, c.b - D, c.b + D];
  const opacity = useTransform(p, range, last ? [0, 1] : [0, 1, 1, 0]);
  const enter = c.id === "auction" ? 1 : 1.12;
  const exit = c.id === "pixel" ? 2.6 : c.id === "breach" ? 1.15 : 0.9;
  const scale = useTransform(p, range, last ? [enter, 1] : [enter, 1, 1, exit]);
  const visibility = useTransform(p, (v) => (v < c.a - D || (!last && v > c.b + D) ? "hidden" : "visible"));
  const Scene = SCENES[c.id];
  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale, visibility }} aria-hidden={c.id === "shield" ? undefined : true}>
      <Scene t={t} packets={packets} price={price} />
    </motion.div>
  );
}

/* ── letter-by-letter mask reveal, scrubbed ── */
function Char({ ch, t, at }: { ch: string; t: MV; at: number }) {
  const y = useTransform(t, [at, at + 0.06], ["108%", "0%"]);
  const rotate = useTransform(t, [at, at + 0.06], [8, 0]);
  return (
    <span className="-mb-[0.14em] inline-block overflow-hidden px-[0.02em] pb-[0.14em] align-bottom">
      <motion.span className="inline-block" style={{ y, rotate, originX: 0, originY: 1 }}>
        {ch === " " ? " " : ch}
      </motion.span>
    </span>
  );
}

function Letters({ text, t, start, className }: { text: string; t: MV; start: number; className?: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap", className)} aria-hidden>
      {[...text].map((ch, i) => (
        <Char key={i} ch={ch} t={t} at={start + i * 0.007} />
      ))}
    </span>
  );
}

function TitleCard({ p, c }: { p: MV; c: Chapter }) {
  const t = useSeg(p, c.a, c.b);
  const opacity = useTransform(t, [0, 0.015, 0.2, 0.29], [0, 1, 1, 0]);
  const scale = useTransform(t, [0.17, 0.29], [1, 1.1]);
  const y = useTransform(t, [0.17, 0.29], [0, -36]);
  const visibility = useTransform(t, (v) => (v <= 0 || v >= 0.29 ? "hidden" : "visible"));
  const rule = useTransform(t, [0.02, 0.14], [0, 1]);
  return (
    <motion.div style={{ opacity, visibility }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,8,11,.94)_0%,rgba(7,8,11,.7)_55%,rgba(7,8,11,.2)_100%)]" />
      <motion.div style={{ scale, y }} className="relative text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ink-3 sm:text-[11px]">
          ch {c.n} / 06 <span className={toneText[c.tone]}>· {chapterTc(c)}</span>
        </div>
        <h3 className="mt-4 font-display text-[clamp(3.2rem,14vw,10.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]" aria-label={`${c.title} ${c.accent}`}>
          <Letters text={c.title} t={t} start={0.015} />{" "}
          <Letters text={c.accent} t={t} start={0.045} className={cn("font-serif font-normal italic tracking-[-0.01em]", toneText[c.tone])} />
        </h3>
        <motion.div style={{ scaleX: rule, background: toneVar[c.tone] }} className="mx-auto mt-5 h-px w-40 origin-center opacity-70" />
      </motion.div>
    </motion.div>
  );
}

function Prologue({ p }: { p: MV }) {
  const [a, b] = PROLOGUE;
  const opacity = useTransform(p, [a + 0.03, b], [1, 0]);
  const scale = useTransform(p, [a, b], [1, 1.14]);
  const y = useTransform(p, [a, b], [0, -40]);
  const visibility = useTransform(p, (v) => (v >= b ? "hidden" : "visible"));
  // variants driven by the (unclipped) h2 entering view; the masked spans themselves never intersect
  const reveal = (d: number) => ({ variants: { hide: { y: "105%" }, show: { y: "0%" } }, transition: { duration: 1.1, delay: d, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <motion.div style={{ opacity, visibility }} className="absolute inset-0 z-20 flex items-center justify-center px-5">
      <motion.div style={{ scale, y }} className="max-w-5xl text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-crimson sm:text-[11px]">{"// the ghost layer, in slow motion"}</div>
        <motion.h2 initial="hide" whileInView="show" viewport={{ once: true }} className="mt-6 font-display text-[clamp(1.9rem,8vw,6.2rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span className="inline-block" {...reveal(0)}>
              The 200 milliseconds
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <motion.span className="inline-block font-serif font-normal italic text-cyan" {...reveal(0.12)}>
              after you click.
            </motion.span>
          </span>
        </motion.h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-2">
          A film in six cuts, cast with your own browser&apos;s data. Scroll to scrub. The timeline is illustrative; the data is yours.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
          <ArrowDown size={12} className="animate-bounce" /> scroll to play
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── per-chapter cross-faded line (HUD chapter name, status, caption) ── */
function Fade({ p, c, last, from = 0, className, children }: { p: MV; c: Chapter; last: boolean; from?: number; className?: string; children: React.ReactNode }) {
  const s = c.a + (c.b - c.a) * from;
  const range = last ? [s - D, s] : [s - D, s, c.b - D, c.b];
  const opacity = useTransform(p, range, last ? [0, 1] : [0, 1, 1, 0]);
  const y = useTransform(p, [s - D, s], [8, 0]);
  return (
    <motion.div style={{ opacity, y }} className={cn("absolute inset-x-0 top-0", className)}>
      {children}
    </motion.div>
  );
}

function Hud({ p }: { p: MV }) {
  const ms = useTransform(p, TC_STOPS, TC_MS);
  const msText = useTransform(ms, (v) => String(Math.round(v)).padStart(3, "0"));
  const hudO = useTransform(p, [0.05, 0.08], [0, 1]);
  return (
    <motion.div style={{ opacity: hudO }} className="pointer-events-none absolute left-4 top-[84px] z-30 font-mono text-[10px] uppercase tracking-[0.22em] sm:left-8 sm:top-[92px] sm:text-[11px]">
      <div className="flex items-center gap-2.5">
        <span className="blink h-1.5 w-1.5 rounded-full bg-crimson" />
        <span className="text-crimson">rec</span>
        <span className="text-ink-3">tc</span>
        <span className="tabular-nums text-ink">
          00:00:<motion.span>{msText}</motion.span>
          <span className="text-ink-3">ms</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-4">
        {CHAPTERS.map((c, i) => (
          <Fade key={c.id} p={p} c={c} last={i === CHAPTERS.length - 1}>
            <span className={toneText[c.tone]}>
              ch {c.n} — {c.accent.replace(".", "")}
            </span>
          </Fade>
        ))}
      </div>
      <div className="relative h-4 text-ink-3">
        {CHAPTERS.map((c, i) => (
          <Fade key={c.id} p={p} c={c} last={i === CHAPTERS.length - 1}>
            {c.status}
          </Fade>
        ))}
      </div>
    </motion.div>
  );
}

function Captions({ p }: { p: MV }) {
  return (
    <div className="pointer-events-none absolute bottom-[52px] left-4 right-4 z-30 h-[56px] sm:bottom-[60px] sm:left-8 sm:right-auto sm:w-[440px]">
      {CHAPTERS.map((c, i) => (
        <Fade key={c.id} p={p} c={c} last={i === CHAPTERS.length - 1} from={0.26}>
          <p className="text-[12.5px] leading-snug text-ink-2 sm:text-[14px]">
            <span className={cn("mr-2 font-mono text-[10px] uppercase tracking-[0.2em]", toneText[c.tone])}>{c.n}</span>
            {c.caption}
          </p>
        </Fade>
      ))}
    </div>
  );
}

function Tick({ p, c }: { p: MV; c: Chapter }) {
  const on = useTransform(p, [c.a - 0.01, c.a], [0.3, 1]);
  return (
    <motion.div style={{ left: `${c.a * 100}%`, opacity: on }} className="absolute top-0 -translate-x-px">
      <span className="block h-2.5 w-px" style={{ background: toneVar[c.tone] }} />
      <span className={cn("mt-1.5 hidden whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.2em] md:block", toneText[c.tone])}>
        {c.n} {c.accent.replace(".", "")}
      </span>
    </motion.div>
  );
}

function Rail({ p }: { p: MV }) {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-6 left-4 right-4 z-30 sm:bottom-7 sm:left-8 sm:right-16">
      <div className="relative h-px bg-line-2">
        <motion.div style={{ scaleX: p }} className="absolute inset-0 origin-left bg-gradient-to-r from-cyan via-amber via-60% to-crimson" />
      </div>
      <div className="relative -mt-[5px]">
        {CHAPTERS.map((c) => (
          <Tick key={c.id} p={p} c={c} />
        ))}
      </div>
    </div>
  );
}

function Backdrop({ p }: { p: MV }) {
  const gridY = useTransform(p, [0, 1], ["0%", "-20%"]);
  const cyan = useTransform(p, [0, 0.37, 0.45, 0.84, 0.9], [1, 1, 0, 0, 1]);
  const amber = useTransform(p, [0.33, 0.42, 0.66, 0.72], [0, 1, 1, 0]);
  const crimson = useTransform(p, [0.66, 0.73, 0.84, 0.88], [0, 1, 1, 0]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div style={{ y: gridY }} className="bg-grid absolute inset-x-0 top-0 h-[140%] opacity-50" />
      <motion.div style={{ opacity: cyan }} className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(0,242,254,.12),transparent_70%)]" />
      <motion.div style={{ opacity: amber }} className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(255,176,32,.11),transparent_70%)]" />
      <motion.div style={{ opacity: crimson }} className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,rgba(255,51,102,.16),transparent_70%)]" />
      <div className="scanlines absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.75))]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-void to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}

export function Film({ packets, price }: { packets: Packet[]; price: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35, restDelta: 0.0005 });
  return (
    <section ref={ref} id="journey" aria-label="The 200 milliseconds after you click" className="relative h-[900vh] bg-void">
      <div className="sticky top-0 h-[100svh] overflow-hidden" data-ghost="scroll-scrubbed film · watch-time per chapter logged · engaged-reader segment">
        <Backdrop p={p} />
        <div className="absolute inset-x-0 bottom-[118px] top-[136px] sm:bottom-[124px] sm:top-[120px]">
          {CHAPTERS.map((c, i) => (
            <Shot key={c.id} p={p} c={c} last={i === CHAPTERS.length - 1} packets={packets} price={price} />
          ))}
        </div>
        <Prologue p={p} />
        {CHAPTERS.map((c) => (
          <TitleCard key={c.id} p={p} c={c} />
        ))}
        <Hud p={p} />
        <Captions p={p} />
        <Rail p={p} />
      </div>
      <ol className="sr-only">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            Chapter {c.n}, {c.title} {c.accent} {c.caption}
          </li>
        ))}
      </ol>
    </section>
  );
}
