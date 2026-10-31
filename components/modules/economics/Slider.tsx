"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { toneBg, toneText, type Tone } from "@/components/ui";

/**
 * Custom-styled range input. The real <input type="range"> sits on top
 * (invisible) so keyboard, screen readers and touch all work natively;
 * the visible track/thumb underneath is purely decorative.
 */
export function Slider({
  label,
  symbol,
  value,
  min,
  max,
  step,
  onChange,
  display,
  valueText,
  tone = "cyan",
  ghost,
  active,
  hint,
}: {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  valueText?: string;
  tone?: Tone;
  ghost?: string;
  active?: boolean;
  hint?: string;
}) {
  const id = useId();
  const frac = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return (
    <div data-ghost={ghost} className="group">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">
          <span className={cn("mr-2 normal-case tracking-normal", toneText[tone])}>{symbol}</span>
          {label}
        </label>
        <motion.span
          key={display}
          initial={{ opacity: 0.4, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("font-mono text-sm tabular-nums", active ? toneText[tone] : "text-ink")}
        >
          {display}
        </motion.span>
      </div>
      <div className="relative mt-3 h-6">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={valueText ?? display}
          onChange={(e) => onChange(Number(e.target.value))}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        {/* track */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line-2" />
        {/* ticks */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="h-2 w-px bg-line-2" />
          ))}
        </div>
        {/* fill */}
        <div
          aria-hidden
          className={cn("pointer-events-none absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full", toneBg[tone])}
          style={{ width: `${frac * 100}%`, boxShadow: active ? `0 0 14px var(--${tone === "ink" ? "ink-2" : tone})` : undefined }}
        />
        {/* thumb */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-void transition-[box-shadow,transform] duration-200",
            "peer-hover:scale-110 peer-active:scale-125 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-void",
            tone === "crimson" ? "border-crimson" : tone === "lime" ? "border-lime" : tone === "amber" ? "border-amber" : "border-cyan",
          )}
          style={{ left: `${frac * 100}%` }}
        >
          <span className={cn("absolute inset-[4px] rounded-full", toneBg[tone])} />
        </div>
      </div>
      {hint && <p className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-3">{hint}</p>}
    </div>
  );
}
