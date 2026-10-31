"use client";

import { motion } from "framer-motion";
import { ease } from "@/components/ui";

export function OpexCallout() {
  return (
    <div
      className="scanlines relative overflow-hidden rounded-3xl border border-crimson/30 bg-crimson/[0.05] px-6 py-14 sm:px-14 sm:py-20"
      data-ghost="quote highlighted → shareable · flag: activist adjacency"
    >
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.24em] text-crimson">{"// thesis"}</p>
      <blockquote className="relative mt-5 max-w-5xl font-display text-[clamp(1.9rem,5.4vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.02em]">
        Fines without structural bans are{" "}
        <motion.span
          className="relative inline-block font-serif font-normal italic tracking-normal text-crimson"
          initial={{ opacity: 0.2 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease, delay: 0.3 }}
        >
          operating expenses.
          <motion.span
            aria-hidden
            className="absolute -bottom-1 left-0 h-[3px] w-full origin-left bg-crimson"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease, delay: 0.6 }}
          />
        </motion.span>
      </blockquote>
      <p className="relative mt-8 max-w-2xl text-[15px] leading-relaxed text-ink-2">
        Fines are provisioned in advance, cut or suspended on appeal, and small next to a year of revenue. Critics of the 2019 settlement noted it placed no
        substantive restriction on how Facebook collects data. Deterrence, the paper concludes, needs penalties that{" "}
        <span className="text-ink">scale with the value of the data</span> and are enforced <span className="text-ink">quickly and consistently</span>.
      </p>
    </div>
  );
}
