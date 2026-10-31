"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ease } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SWAPS, toolById, type Category } from "@/lib/data/tools";

export function SwapMatrix({ active, onPick }: { active: Category | "All"; onPick: (c: Category) => void }) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setTick((n) => n + 1), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {SWAPS.map((s, i) => {
        const alts = s.alts.map((id) => toolById(id)).filter((t) => t !== undefined);
        const paused = hover === s.bigTech;
        const idx = alts.length ? (paused ? 0 : (tick + i) % alts.length) : 0;
        const cur = alts[idx];
        const on = active === s.category;
        return (
          <motion.button
            key={s.bigTech}
            type="button"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5% 0px" }}
            transition={{ delay: (i % 4) * 0.06, duration: 0.6, ease }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setHover(s.bigTech)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(s.bigTech)}
            onBlur={() => setHover(null)}
            onClick={() => onPick(s.category)}
            aria-pressed={on}
            aria-label={`Replace ${s.bigTech} — show ${s.category} tools`}
            data-ghost={`${s.vendor.toLowerCase()} dependency: ${s.bigTech.toLowerCase()} → churn risk flagged`}
            className={cn(
              "glass glass-hover group relative flex min-h-[188px] flex-col overflow-hidden rounded-2xl p-5 text-left focus-visible:outline-2 focus-visible:outline-cyan",
              on && "border-lime/40 bg-lime/[0.04]",
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              {s.vendor} · {s.category}
            </span>

            {/* struck-through big tech name */}
            <span className="relative mt-3 inline-block self-start">
              <motion.span
                className="font-display text-[22px] font-extrabold leading-none tracking-tight"
                initial={{ color: "rgba(232,234,240,1)" }}
                whileInView={{ color: "rgba(255,51,102,0.55)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i % 4) * 0.06, duration: 0.5 }}
              >
                {s.bigTech}
              </motion.span>
              <motion.span
                aria-hidden
                className="absolute left-[-4px] right-[-4px] top-1/2 h-[3px] origin-left -translate-y-1/2 rounded-full bg-crimson shadow-[0_0_14px_rgba(255,51,102,0.7)]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + (i % 4) * 0.06, duration: 0.55, ease }}
              />
            </span>
            <span className="mt-2 font-mono text-[10.5px] leading-snug text-crimson/80">harvests: {s.harvest}</span>

            <ArrowDown size={14} className="mt-3 text-ink-3 transition-transform group-hover:translate-y-0.5" />

            <span className="relative mt-1 block h-8 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {cur && (
                  <motion.span
                    key={cur.id}
                    initial={{ y: 18, opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -18, opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.4, ease }}
                    className="text-glow-lime absolute inset-x-0 top-0 truncate font-display text-[22px] font-extrabold leading-8 tracking-tight text-lime"
                  >
                    {cur.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="mt-auto flex gap-1 pt-3" aria-hidden>
              {alts.map((a, k) => (
                <span key={a.id} className={cn("h-1 rounded-full transition-all duration-300", k === idx ? "w-5 bg-lime" : "w-1.5 bg-line-2")} />
              ))}
              <span className="ml-auto font-mono text-[10px] text-ink-3">{alts.length} swap{alts.length > 1 ? "s" : ""}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
