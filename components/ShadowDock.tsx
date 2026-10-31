"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fingerprint, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { BASE_CPM, oneIn, useShadow } from "@/lib/shadow";

export function ShadowDock() {
  const { fields, redacted, toggle, bits, price, dockOpen, setDockOpen } = useShadow();
  const maxPrice = BASE_CPM + fields.reduce((a, f) => a + f.cpm, 0);
  const history = usePriceHistory(price);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDockOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDockOpen]);

  return (
    <>
      {/* edge tab */}
      <motion.button
        onClick={() => setDockOpen(true)}
        initial={{ x: 60 }}
        animate={{ x: dockOpen ? 60 : 0 }}
        transition={{ delay: dockOpen ? 0 : 1.2, type: "spring", stiffness: 220, damping: 24 }}
        className="glass fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-l-xl border-r-0 px-2 py-4 md:flex"
        aria-label="Open your shadow profile"
        data-ghost="checked own profile → anxiety signal · retarget with VPN ads"
      >
        <Fingerprint size={16} className="text-crimson" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2 [writing-mode:vertical-rl]">
          shadow profile · {fields.length - redacted.size} fields
        </span>
        <span className="font-mono text-[11px] tabular-nums text-crimson [writing-mode:vertical-rl]">${price.toFixed(2)}</span>
      </motion.button>

      <AnimatePresence>
        {dockOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[65] bg-void/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDockOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-label="Your shadow profile"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              data-lenis-prevent
              className="fixed inset-y-0 right-0 z-[66] flex w-full max-w-[440px] flex-col overflow-y-auto overscroll-contain border-l border-line bg-carbon/95 backdrop-blur-xl"
            >
              <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative flex items-start justify-between border-b border-line p-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-crimson">file no. {fields.find((f) => f.id === "canvas")?.value.slice(0, 8) ?? "········"}</div>
                  <h2 className="mt-2 font-display text-3xl font-extrabold">
                    Subject: <span className="font-serif font-normal italic text-crimson">you</span>
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-ink-2">Compiled in this tab in under a second, without a single cookie. Click any line to redact it.</p>
                </div>
                <button onClick={() => setDockOpen(false)} className="rounded-full p-2 text-ink-3 hover:text-ink" aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              {/* price + uniqueness */}
              <div className="relative grid grid-cols-2 border-b border-line">
                <div className="border-r border-line p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">your auction price</div>
                  <div className="mt-1 font-display text-4xl font-extrabold tabular-nums text-crimson text-glow-crimson">${price.toFixed(2)}</div>
                  <div className="font-mono text-[10px] text-ink-3">illustrative CPM · max ${maxPrice.toFixed(2)}</div>
                  <Spark data={history} max={maxPrice} />
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">identifiability</div>
                  <div className="mt-1 font-display text-4xl font-extrabold tabular-nums">{bits.toFixed(1)}<span className="text-lg text-ink-3"> bits</span></div>
                  <div className="font-mono text-[10px] text-ink-3">≈ 1 in {oneIn(bits)} browsers</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div className="h-full bg-gradient-to-r from-amber to-crimson" animate={{ width: `${Math.min(100, (bits / 33) * 100)}%` }} />
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-ink-3">33 bits ≈ unique among all humans</div>
                </div>
              </div>

              <ul className="relative flex-1 divide-y divide-line">
                {fields.map((f) => {
                  const off = redacted.has(f.id);
                  return (
                    <li key={f.id}>
                      <button onClick={() => toggle(f.id)} className="group w-full px-6 py-3.5 text-left transition-colors hover:bg-white/[0.03]">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
                          <span className={off ? "text-lime" : "text-ink-3"}>{f.label}</span>
                          <span className={cn("tabular-nums", off ? "text-lime" : "text-crimson")}>{off ? "REDACTED" : `+$${f.cpm.toFixed(2)} · ${f.bits}b`}</span>
                        </div>
                        <div className="relative mt-1">
                          <span className={cn("font-mono text-[13px] transition-opacity", off ? "opacity-0" : "text-ink")}>{f.value || "—"}</span>
                          <motion.span
                            className="absolute inset-y-0.5 left-0 bg-ink"
                            initial={false}
                            animate={{ width: off ? "100%" : "0%" }}
                            transition={{ type: "spring", stiffness: 200, damping: 26 }}
                          />
                        </div>
                        <div className={cn("mt-1 text-[12px]", off ? "text-ink-3 line-through" : "text-amber/90")}>→ {f.inference}</div>
                        <div className="mt-1 max-h-0 overflow-hidden text-[11px] text-lime/80 transition-all group-hover:max-h-10">fix: {f.defense}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="relative border-t border-line p-6">
                <Link
                  href="/defense"
                  onClick={() => setDockOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-void"
                >
                  <ShieldCheck size={15} /> Redact it for real — 90-min toolkit
                </Link>
                <p className="mt-3 text-center font-mono text-[10px] text-ink-3">nothing here left your device · no cookies · no analytics</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function usePriceHistory(price: number) {
  const [h, setH] = useState<number[]>([]);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (last.current === price) return;
    last.current = price;
    setH((p) => [...p.slice(-23), price]);
  }, [price]);
  return h;
}

function Spark({ data, max }: { data: number[]; max: number }) {
  if (data.length < 2) return <div className="mt-3 h-8" />;
  const w = 160,
    h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / Math.max(max, 0.01)) * h}`).join(" ");
  return (
    <svg className="mt-3 h-8 w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--crimson)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
