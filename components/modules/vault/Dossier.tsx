"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Redacted, Source, spring, ease, toneText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SEVERITY_META, type VaultCase } from "@/lib/data/cases";
import { CategoryPill, SeverityMeter, Stamp } from "./bits";
import { ExploitChain } from "./ExploitChain";
import { Ledger, PenaltyList } from "./Ledger";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Label({ children, tone = "text-ink-3" }: { children: React.ReactNode; tone?: string }) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.22em]", tone)}>{children}</p>;
}

export function Dossier({
  c,
  position,
  onClose,
  onPrev,
  onNext,
}: {
  c: VaultCase;
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onClose, onPrev, onNext });
  useEffect(() => {
    handlers.current = { onClose, onPrev, onNext };
  });

  /* mount: focus, key handling (Esc / ← → / Tab trap), scroll lock; unmount: restore */
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handlers.current.onClose();
      } else if (e.key === "ArrowRight") {
        handlers.current.onNext();
      } else if (e.key === "ArrowLeft") {
        handlers.current.onPrev();
      } else if (e.key === "Tab" && panelRef.current) {
        const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!panelRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
  }, []);

  /* new file → back to top */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [c.id]);

  const sev = SEVERITY_META[c.severity];

  return (
    <motion.div
      className="fixed inset-0 z-[90]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-void/85 backdrop-blur-md" onClick={onClose} aria-hidden />

      <div ref={scrollRef} data-lenis-prevent className="absolute inset-0 overflow-y-auto overscroll-contain" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-title"
          initial={{ y: 60, opacity: 0, rotateX: 8, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={spring}
          style={{ transformPerspective: 1200 }}
          className="relative mx-auto my-4 w-[calc(100%-1.5rem)] max-w-5xl overflow-hidden rounded-2xl border border-line-2 bg-carbon shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:my-10"
        >
          {/* top glow in severity colour */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(closest-side, var(--${sev.tone === "ink" ? "ink-3" : sev.tone}), transparent)` }}
          />

          {/* ── toolbar ── */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-carbon/90 px-4 py-3 backdrop-blur sm:px-6">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-3">
              File {c.file} · {position}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <motion.button whileTap={{ scale: 0.92 }} type="button" onClick={onPrev} aria-label="Previous file (left arrow)" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-cyan outline-none">
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} type="button" onClick={onNext} aria-label="Next file (right arrow)" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 hover:border-line-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-cyan outline-none">
                <ChevronRight size={16} />
              </motion.button>
              <motion.button
                ref={closeRef}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={onClose}
                aria-label="Close dossier (Escape)"
                className="ml-1 flex h-9 items-center gap-2 rounded-full border border-line px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2 hover:border-crimson/50 hover:text-crimson focus-visible:ring-2 focus-visible:ring-cyan outline-none"
              >
                <X size={14} /> <span className="hidden sm:inline">Esc</span>
              </motion.button>
            </div>
          </div>

          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }} className="relative px-4 pb-10 pt-8 sm:px-10 sm:pt-10">
            {/* ── header ── */}
            <div className="relative">
              <motion.div
                className="absolute right-0 top-0 hidden sm:block"
                initial={{ scale: 2.4, opacity: 0, rotate: -24 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 420, damping: 18 }}
              >
                <Stamp tone={sev.tone} className="px-3 py-1 text-[13px]">Declassified</Stamp>
              </motion.div>
              <Label tone={toneText[sev.tone]}>{c.codename}</Label>
              <h2 id="dossier-title" className="mt-3 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.8rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink" data-ghost={c.ghost}>
                {c.company}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-2 font-mono text-[12px] tabular-nums text-ink-2">{c.years}</span>
                <SeverityMeter level={c.severity} className="mr-2" />
                {c.categories.map((cat) => (
                  <CategoryPill key={cat} cat={cat} />
                ))}
              </div>
              <p className="mt-6 max-w-3xl font-serif text-[clamp(1.35rem,2.6vw,1.9rem)] italic leading-snug text-ink-2">{c.headline}</p>

              <div className="mt-6 inline-flex items-baseline gap-3 rounded-xl border border-line bg-void/60 px-4 py-3" data-ghost={`scale stat viewed: ${c.scale.display} · outrage index ↑`}>
                <span className={cn("font-mono text-3xl font-bold tabular-nums", toneText[sev.tone])}>{c.scale.display}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">{c.scale.unit}</span>
              </div>
              <Source>{c.scale.note}</Source>
            </div>

            {/* ── deception vs reality ── */}
            <div className="mt-12 grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
              <div className="relative bg-amber/[0.04] p-5 sm:p-7" data-ghost="read the company's promise · trust score recalculated">
                <Label tone="text-amber">◇ What they told you</Label>
                <p className="mt-4 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">{c.deception.claim}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.deception.detail}</p>
              </div>
              <div className="relative border-t border-line bg-crimson/[0.05] p-5 sm:p-7 md:border-l md:border-t-0" data-ghost="read 'what actually happened' · skeptic segment · ad-blocker likely">
                <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />
                <Label tone="text-crimson">◆ What actually happened</Label>
                <ul className="relative mt-4 space-y-3">
                  {c.reality.map((r, i) => (
                    <li key={i} className="text-[15px] leading-relaxed text-ink">
                      <Redacted delay={0.3 + i * 0.35} bar="bg-crimson">
                        {r}
                      </Redacted>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── exploit chain ── */}
            <div className="mt-12">
              <Label tone="text-cyan">▸ Exploit chain — how the data moved</Label>
              <div className="mt-4">
                <ExploitChain chain={c.chain} codename={c.codename} />
              </div>
              <ol className="mt-6 grid gap-3 md:grid-cols-2">
                {c.exploit.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease }}
                    className="flex gap-3 rounded-xl border border-line bg-void/40 p-4"
                  >
                    <span className="font-mono text-[12px] font-bold tabular-nums text-cyan">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[14.5px] leading-relaxed text-ink-2">{step}</span>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* ── money ── */}
            <div className="mt-12 grid gap-4 md:grid-cols-5">
              <div className="glass rounded-2xl p-5 sm:p-6 md:col-span-3">
                <Ledger ledger={c.ledger} />
              </div>
              <div className="glass rounded-2xl p-5 sm:p-6 md:col-span-2">
                <Label>Penalties on file</Label>
                <div className="mt-4">
                  <PenaltyList penalties={c.penalties} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line p-5 sm:p-6" data-ghost="interest: corporate revenue · investor-adjacent · finance ads">
                <Label tone="text-amber">$ Money gained / scale</Label>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.gain}</p>
              </div>
              <div className="rounded-2xl border border-line p-5 sm:p-6">
                <Label>⌁ Outcome</Label>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.outcome}</p>
              </div>
            </div>

            {/* ── lesson ── */}
            <div className="relative mt-12 overflow-hidden rounded-2xl border border-lime/30 bg-lime/[0.04] p-5 sm:p-7" data-ghost="read defensive advice → opt-out probability ↑ 40% · value ↓">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-lime" />
                <Label tone="text-lime">Lesson for you</Label>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {c.lesson.map((l, i) => (
                  <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-ink">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            {c.caveat && (
              <div className="mt-4 flex gap-3 rounded-2xl border border-amber/30 bg-amber/[0.04] p-5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" />
                <div>
                  <Label tone="text-amber">Analyst note — verification</Label>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{c.caveat}</p>
                </div>
              </div>
            )}

            {/* ── sources ── */}
            <div className="mt-10 border-t border-line pt-6">
              <Label>Filed by · {c.authors}</Label>
              <div className="mt-1">
                {c.sources.map((s) => (
                  <Source key={s}>{s}</Source>
                ))}
              </div>
              <p className="mt-6 font-mono text-[10.5px] tracking-wide text-ink-3">
                ← → to flip files · Esc to close · educational summary, not legal advice
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
