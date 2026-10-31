"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { toneText, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";

export type LogLine = { id: number; t: number; text: string; tone?: Tone };

export function LogConsole({ lines, running }: { lines: LogLine[]; running: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-line bg-void/90"
      data-ghost="watched the scan log >5s → technical user · dev-tools segment +$0.04 CPM"
      // CRT power-on: a bright horizontal line snaps open, flickers, then settles
      initial={{ scaleY: 0.012, scaleX: 0.7, opacity: 0, filter: "brightness(3)" }}
      whileInView={reduce ? { scaleY: 1, scaleX: 1, opacity: 1, filter: "brightness(1)" } : { scaleY: [0.012, 0.012, 1, 1, 1], scaleX: [0.7, 1, 1, 1, 1], opacity: [0, 1, 1, 0.55, 1], filter: ["brightness(3)", "brightness(3)", "brightness(1.6)", "brightness(0.8)", "brightness(1)"] }}
      viewport={{ once: true, margin: "0px 0px -3% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, times: [0, 0.18, 0.5, 0.7, 1], ease: "easeOut" }}
    >
      <span aria-hidden className="ticks pointer-events-none absolute inset-0" />
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-crimson/70" />
          <span className="h-2 w-2 rounded-full bg-amber/70" />
          <span className="h-2 w-2 rounded-full bg-lime/70" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">kyd-audit · tty0 · offline</span>
      </div>
      <div
        ref={box}
        role="log"
        aria-live="polite"
        aria-label="Scan log"
        tabIndex={0}
        data-lenis-prevent
        className="scanlines h-60 overflow-y-auto overscroll-contain px-3 py-2 font-mono text-[11.5px] leading-[1.65] focus-visible:outline-2 focus-visible:outline-cyan sm:h-72"
      >
        {lines.map((l) => (
          <div key={l.id} className="flex gap-2">
            <span className="shrink-0 text-ink-3/70 tabular-nums">{(l.t / 1000).toFixed(3).padStart(6, "0")}</span>
            <motion.span
              className={cn("min-w-0 whitespace-pre-wrap break-words", l.tone ? toneText[l.tone] : "text-ink-2")}
              // typed-in reveal: a hard-edged clip wipes across the line, stepping like a teletype
              initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: Math.min(0.55, 0.12 + l.text.length * 0.006), ease: stepEase(Math.max(6, Math.min(28, l.text.length >> 1))) }}
            >
              {l.text}
            </motion.span>
          </div>
        ))}
        {running && (
          <div className="flex gap-2">
            <span className="text-ink-3/70">{"      "}</span>
            <span className="blink text-cyan">▍</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function stepEase(n: number) {
  return (t: number) => Math.min(1, Math.ceil(t * n) / n);
}
