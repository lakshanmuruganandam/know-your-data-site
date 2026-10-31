"use client";

import { useEffect, useRef } from "react";
import { toneText, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";

export type LogLine = { id: number; t: number; text: string; tone?: Tone };

export function LogConsole({ lines, running }: { lines: LogLine[]; running: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-void/90" data-ghost="watched the scan log >5s → technical user · dev-tools segment +$0.04 CPM">
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
        className="scanlines h-60 overflow-y-auto overscroll-contain px-3 py-2 font-mono text-[11.5px] leading-[1.65] focus-visible:outline-2 focus-visible:outline-cyan sm:h-72"
      >
        {lines.map((l) => (
          <div key={l.id} className="flex gap-2">
            <span className="shrink-0 text-ink-3/70 tabular-nums">{(l.t / 1000).toFixed(3).padStart(6, "0")}</span>
            <span className={cn("min-w-0 whitespace-pre-wrap break-words", l.tone ? toneText[l.tone] : "text-ink-2")}>{l.text}</span>
          </div>
        ))}
        {running && (
          <div className="flex gap-2">
            <span className="text-ink-3/70">{"      "}</span>
            <span className="blink text-cyan">▍</span>
          </div>
        )}
      </div>
    </div>
  );
}
