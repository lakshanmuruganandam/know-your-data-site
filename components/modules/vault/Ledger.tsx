"use client";

import { motion } from "framer-motion";
import { ease, toneBg, toneText } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Penalty, VaultCase } from "@/lib/data/cases";

/* ── Penalty-vs-gain bars: linear scale on purpose — the fine is meant to look like a sliver ── */
export function Ledger({ ledger }: { ledger: VaultCase["ledger"] }) {
  const max = Math.max(...ledger.bars.map((b) => b.value), 1);
  return (
    <div data-ghost="compared fine vs revenue → anti-corporate sentiment +0.3 · exclude from brand-safe">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">{ledger.title}</p>
      <ul className="mt-4 space-y-4">
        {ledger.bars.map((b, i) => {
          const pct = b.value === 0 ? 0 : Math.max((b.value / max) * 100, 0.8);
          return (
            <li key={b.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink-2">{b.label}</span>
                <span className={cn("font-mono text-sm tabular-nums", toneText[b.tone])}>{b.display}</span>
              </div>
              <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.04]" role="presentation">
                <motion.div
                  className={cn("h-full rounded-full", toneBg[b.tone], b.tone === "ink" && "opacity-40")}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 1.1, ease }}
                />
                {b.value === 0 && <span className="absolute inset-y-0 left-0 w-px bg-crimson" />}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-ink-3">{ledger.note}</p>
    </div>
  );
}

const STATUS: Record<Penalty["status"], { label: string; cls: string }> = {
  final: { label: "Final", cls: "text-crimson border-crimson/40" },
  settled: { label: "Settled", cls: "text-amber border-amber/40" },
  appealed: { label: "Under appeal", cls: "text-cyan border-cyan/40" },
  overturned: { label: "Overturned", cls: "text-ink-3 border-line-2" },
  pending: { label: "Pending", cls: "text-cyan border-cyan/40" },
  none: { label: "No penalty", cls: "text-ink-3 border-line-2" },
};

export function PenaltyList({ penalties }: { penalties: Penalty[] }) {
  return (
    <ul className="divide-y divide-line">
      {penalties.map((p, i) => (
        <motion.li
          key={`${p.authority}-${p.year}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.5, ease }}
          className="py-3 first:pt-0 last:pb-0"
          data-ghost={`read penalty: ${p.authority.slice(0, 32)} · regulatory-interest flag set`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] tabular-nums text-ink-3">{p.year}</span>
            <span className="text-sm font-medium text-ink">{p.authority}</span>
            <span className={cn("ml-auto rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]", STATUS[p.status].cls)}>
              {STATUS[p.status].label}
            </span>
          </div>
          <p className={cn("mt-1 font-mono text-[13px] text-ink-2", p.status === "overturned" && "line-through decoration-crimson/70")}>{p.amount}</p>
          {p.note && <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{p.note}</p>}
        </motion.li>
      ))}
    </ul>
  );
}
