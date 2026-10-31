"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { forwardRef, useCallback, useRef } from "react";
import { spring, toneBg, toneText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SEVERITY_META, type VaultCase } from "@/lib/data/cases";
import { CategoryPill, SeverityMeter, Stamp } from "./bits";

/* ── A classified case file in the vault grid ── */
export const CaseFolder = forwardRef<HTMLLIElement, { c: VaultCase; onOpen: () => void; index: number; buttonRef?: (el: HTMLButtonElement | null) => void }>(function CaseFolder({ c, onOpen, index, buttonRef }, ref) {
  const sev = SEVERITY_META[c.severity];
  const reduce = useReducedMotion();
  const local = useRef<HTMLLIElement | null>(null);
  const setRef = useCallback(
    (el: HTMLLIElement | null) => {
      local.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  /* scroll-parallax depth: each column drifts at its own rate, like files at different depths in the drawer */
  const { scrollYProgress } = useScroll({ target: local, offset: ["start end", "end start"] });
  const depth = [0.55, 1, 0.75][index % 3];
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [34 * depth, -34 * depth]);
  const y = useSpring(drift, { stiffness: 120, damping: 28, mass: 0.4 });
  return (
    <motion.li
      ref={setRef}
      layout
      /* files slide up out of the cabinet: hinged at the bottom edge, tilted back in 3D, staggered per column */
      initial={{ opacity: 0, y: 70, rotateX: -62, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -3% 0px" }}
      exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, mass: 0.9, delay: (index % 3) * 0.09 }}
      style={{ transformPerspective: 900, originY: 1 }}
      className="relative"
    >
      <motion.div style={{ y }} className="relative h-full pt-4">
      {/* folder tab */}
      <span aria-hidden className="absolute left-5 top-0 flex h-5 items-center gap-2 rounded-t-md border border-b-0 border-line bg-zinc px-3 font-mono text-[10px] tracking-[0.2em] text-ink-3">
        <span className={cn("h-1.5 w-1.5 rounded-full", toneBg[sev.tone])} />
        FILE {c.file}
      </span>

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={onOpen}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        aria-label={`Open file ${c.file}: ${c.codename}, ${c.company}, ${c.years}`}
        aria-haspopup="dialog"
        data-ghost={c.ghost}
        className="glass glass-hover group relative flex h-full w-full flex-col overflow-hidden rounded-2xl rounded-tl-none p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan sm:p-6"
      >
        {/* severity spine */}
        <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px] opacity-80", toneBg[sev.tone])} />
        {/* paper peeking out on hover */}
        <span aria-hidden className="absolute inset-x-6 top-0 h-10 -translate-y-8 rounded-b-md border border-t-0 border-line-2 bg-zinc-2/80 transition-transform duration-500 group-hover:-translate-y-3 group-focus-visible:-translate-y-3">
          <span className="ml-3 mt-2 block h-1 w-2/3 rounded bg-white/10" />
          <span className="ml-3 mt-1.5 block h-1 w-1/3 rounded bg-white/10" />
        </span>

        <span className="relative flex items-start justify-between gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-3">{c.years}</span>
          <Stamp tone={sev.tone} className="mt-1 transition-transform duration-500 group-hover:-rotate-[4deg] group-hover:scale-105">
            Classified
          </Stamp>
        </span>

        <span className={cn("relative mt-5 block font-mono text-[11px] uppercase tracking-[0.24em]", toneText[sev.tone])}>{c.codename}</span>
        <span className="relative mt-2 block font-display text-2xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[1.7rem]">{c.company}</span>
        <span className="relative mt-3 block text-[14.5px] leading-relaxed text-ink-2">{c.headline}</span>

        <span className="relative mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
          <span>
            <span className={cn("block font-mono text-2xl font-bold tabular-nums", toneText[sev.tone])}>{c.scale.display}</span>
            <span className="block max-w-[14rem] font-mono text-[10.5px] uppercase leading-snug tracking-[0.12em] text-ink-3">{c.scale.unit}</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-2 text-ink-2 transition-colors group-hover:border-cyan/50 group-hover:text-cyan">
            <ArrowUpRight size={16} />
          </span>
        </span>

        <span className="relative mt-4 flex flex-wrap items-center gap-2">
          <SeverityMeter level={c.severity} className="mr-1" />
          {c.categories.map((cat) => (
            <CategoryPill key={cat} cat={cat} />
          ))}
        </span>
      </motion.button>
      </motion.div>
    </motion.li>
  );
});
