"use client";

import { motion, useAnimate, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { toneText, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";

const CX = 120;
const CY = 120;
const R = 92;
const START = 135;
const SWEEP = 270;

function pt(deg: number, r = R) {
  const a = (deg * Math.PI) / 180;
  return [Math.round((CX + r * Math.cos(a)) * 100) / 100, Math.round((CY + r * Math.sin(a)) * 100) / 100] as const;
}
const [sx, sy] = pt(START);
const [ex, ey] = pt(START + SWEEP);
const ARC = `M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`;
const TICKS = 48;

export function grade(score: number): { label: string; tone: Tone } {
  if (score < 20) return { label: "Hardened", tone: "lime" };
  if (score < 45) return { label: "Guarded", tone: "cyan" };
  if (score < 70) return { label: "Exposed", tone: "amber" };
  return { label: "Wide open", tone: "crimson" };
}

export function Gauge({ score, running, done, total }: { score: number; running: boolean; done: number; total: number }) {
  const reduce = useReducedMotion();
  const mv = useSpring(0, { stiffness: 60, damping: 18 });
  const text = useTransform(mv, (v) => String(Math.round(v)).padStart(2, "0"));
  const len = useTransform(mv, (v) => Math.max(0.001, v / 100));
  // needle rides a looser spring so it overshoots and settles like a real meter
  const needle = useSpring(0, reduce ? { stiffness: 400, damping: 60 } : { stiffness: 140, damping: 9, mass: 0.9 });
  const needleDeg = useTransform(needle, (v) => START + (SWEEP * Math.max(0, Math.min(104, v))) / 100);
  useEffect(() => {
    mv.set(score);
    needle.set(score);
  }, [score, mv, needle]);

  // glow bloom: fires once when a scan finishes
  const [bloomRef, animateBloom] = useAnimate<HTMLDivElement>();
  const wasRunning = useRef(running);
  useEffect(() => {
    if (wasRunning.current && !running && !reduce && bloomRef.current) {
      void animateBloom(bloomRef.current, { opacity: [0, 0.85, 0], scale: [0.55, 1.08, 1.35] }, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    }
    wasRunning.current = running;
  }, [running, reduce, animateBloom, bloomRef]);
  const { label, tone } = grade(score);
  const color = `var(--${tone})`;
  const lit = Math.round((score / 100) * TICKS);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]" data-ghost="ran a privacy audit → segment: privacy-curious · bid −$0.08 · churn risk ↑">
      {/* soft radial glow keyed to grade */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full opacity-40 blur-3xl transition-colors duration-700" style={{ background: color }} />
      <div ref={bloomRef} aria-hidden className="pointer-events-none absolute inset-[6%] rounded-full opacity-0 blur-2xl" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 68%)` }} />
      <svg viewBox="0 0 240 240" className="relative h-full w-full" role="img" aria-label={`Exposure score ${score} out of 100 — ${label}`}>
        {/* tick ring */}
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const deg = START + (SWEEP * i) / TICKS;
          const major = i % 6 === 0;
          const [x1, y1] = pt(deg, 108);
          const [x2, y2] = pt(deg, major ? 100 : 103);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i <= lit && score > 0 ? color : "var(--ink-3)"}
              strokeOpacity={i <= lit && score > 0 ? 0.95 : 0.35}
              strokeWidth={major ? 1.6 : 0.8}
              style={{ transition: "stroke 0.4s" }}
            />
          );
        })}
        {/* track + value arc */}
        <path d={ARC} fill="none" stroke="var(--line-2)" strokeWidth="10" strokeLinecap="round" />
        <motion.path d={ARC} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" style={{ pathLength: len, transition: "stroke 0.6s" }} />
        <path d={ARC} fill="none" stroke="var(--void)" strokeWidth="10" strokeDasharray="1 5" strokeOpacity="0.5" />
        {/* radar sweep while scanning */}
        {running && !reduce && (
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}>
            <defs>
              <linearGradient id="kyd-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--cyan)" stopOpacity="0" />
                <stop offset="1" stopColor="var(--cyan)" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="80" fill="none" stroke="none" />
            <path d={`M120 120 L ${pt(-28, 80).join(" ")} A 80 80 0 0 1 ${pt(0, 80).join(" ")} Z`} fill="url(#kyd-sweep)" />
            <line x1="120" y1="120" x2={pt(0, 80)[0]} y2={pt(0, 80)[1]} stroke="var(--cyan)" strokeWidth="1" />
          </motion.g>
        )}
        {/* meter needle — spring overshoot; bbox-centred circle keeps the rotation origin on the hub */}
        <motion.g style={{ rotate: needleDeg }} aria-hidden>
          <circle cx="120" cy="120" r="88" fill="none" stroke="none" />
          <line x1="176" y1="120" x2="206" y2="120" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.6s", filter: `drop-shadow(0 0 4px ${color})` }} />
          <circle cx="206" cy="120" r="2.6" fill={color} style={{ transition: "fill 0.6s" }} />
        </motion.g>
        <circle cx="120" cy="120" r="70" fill="none" stroke="var(--line)" />
        <circle cx="120" cy="120" r="54" fill="none" stroke="var(--line)" strokeDasharray="2 4" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">Exposure</span>
        <motion.span className={cn("font-display text-[64px] font-extrabold leading-none tabular-nums sm:text-[72px]", toneText[tone])}>{text}</motion.span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">/ 100</span>
        <span className={cn("mt-2 font-serif text-xl italic", toneText[tone])}>{running ? "scanning…" : label}</span>
      </div>
      <div className="absolute inset-x-0 bottom-[4%] text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        {done}/{total} probes
      </div>
    </div>
  );
}
