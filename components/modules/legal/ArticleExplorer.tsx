"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Tag, ease, spring } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ARTICLES, REGIMES } from "./articles";

const groupTone = {
  Scope: "text-cyan border-cyan/40",
  "Lawful basis": "text-amber border-amber/40",
  "Your rights": "text-lime border-lime/40",
  Enforcement: "text-crimson border-crimson/40",
} as const;

export function ArticleExplorer() {
  const [sel, setSel] = useState("13");
  const a = ARTICLES.find((x) => x.art === sel) ?? ARTICLES[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* article rail */}
      <div role="tablist" aria-label="PDPL articles" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {ARTICLES.map((x) => {
          const on = x.art === sel;
          return (
            <motion.button
              key={x.art}
              role="tab"
              aria-selected={on}
              aria-controls="article-panel"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSel(x.art)}
              data-ghost={x.ghost}
              className={cn(
                "relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-cyan",
                on ? "border-lime/50 bg-lime/[0.06]" : "border-line bg-carbon/60 hover:border-line-2 hover:bg-white/[0.03]",
              )}
            >
              {on && <motion.span layoutId="art-glow" transition={spring} className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(0,255,136,0.12),transparent_60%)]" />}
              <span className={cn("relative block font-mono text-[10px] uppercase tracking-[0.2em]", groupTone[x.group].split(" ")[0])}>{x.group}</span>
              <span className="relative mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold tabular-nums">{x.art}</span>
                <span className="text-[13px] leading-tight text-ink-2">{x.title.split(" — ")[0]}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* explainer */}
      <div id="article-panel" role="tabpanel" aria-live="polite" className="glass ticks relative min-h-[420px] overflow-hidden rounded-2xl p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={a.art}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn("rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]", groupTone[a.group])}>PDPL Art. {a.art}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">≈ {a.gdpr.split(" — ")[0]}</span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl">{a.title}</h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">{a.plain}</p>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div data-ghost="rights awareness detected → compliance cost per subject ↑">
                <Tag tone="lime">What you can demand</Tag>
                <ul className="mt-3 space-y-2">
                  {a.demand.map((d) => (
                    <li key={d} className="flex gap-2 text-[14px] leading-snug text-ink">
                      <span className="mt-[7px] h-1 w-3 shrink-0 bg-lime" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-ghost="exemption lookup → loophole map cached">
                <Tag tone="amber">{a.art === "2" ? "Outside the PDPL" : a.art === "4" ? "Grounds (no consent needed)" : "Exemptions"}</Tag>
                <ul className="mt-3 space-y-2">
                  {a.exemptions.map((d) => (
                    <li key={d} className="flex gap-2 text-[14px] leading-snug text-ink-2">
                      <span className="mt-[7px] h-1 w-3 shrink-0 bg-amber/70" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-8 border-t border-line pt-4 font-mono text-[11.5px] leading-relaxed text-ink-3">
              <span className="text-cyan">GDPR EQUIVALENT ▸</span> {a.gdpr}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ScopeGuide() {
  const [sel, setSel] = useState(REGIMES[0].id);
  const r = REGIMES.find((x) => x.id === sel) ?? REGIMES[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">Where is the company registered?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {REGIMES.map((x) => (
            <motion.button
              key={x.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSel(x.id)}
              aria-pressed={x.id === sel}
              data-ghost={`registry check: ${x.id} → enforcement odds recalculated`}
              className={cn(
                "rounded-full border px-4 py-2 text-left text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-cyan",
                x.id === sel ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line text-ink-2 hover:border-line-2 hover:text-ink",
              )}
            >
              {x.where}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="glass relative overflow-hidden rounded-2xl p-6" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.dl key={r.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3, ease }} className="space-y-4">
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Law that applies</dt>
              <dd className="mt-1 font-display text-xl font-bold leading-snug">{r.law}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Complain to</dt>
              <dd className="mt-1 text-cyan">{r.regulator}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Tip</dt>
              <dd className="mt-1 text-[14px] leading-relaxed text-ink-2">{r.note}</dd>
            </div>
          </motion.dl>
        </AnimatePresence>
      </div>
    </div>
  );
}
