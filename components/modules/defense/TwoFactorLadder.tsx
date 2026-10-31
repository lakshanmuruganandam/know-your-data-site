"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { spring } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TWO_FA } from "./data";

const toneFor = (score: number) => (score >= 4.5 ? "lime" : score >= 3 ? "cyan" : score >= 2 ? "amber" : "crimson");

const GHOST = [
  "fido2 key → origin-bound · phishing kit returns nothing",
  "passkey → only risk: the syncing account itself",
  "totp code → relayable by evilginx proxy within 30s",
  "push spam ×20 at 2am → fatigue approval likely",
  "sms otp → sim-swap / ss7 intercept · uae number = emirates id",
];

/** Rungs: widest/highest = most attack-resistant */
export function TwoFactorLadder() {
  const [sel, setSel] = useState(0);
  const m = TWO_FA[sel];
  const tone = toneFor(m.score);

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative pl-6" role="radiogroup" aria-label="Second-factor methods, strongest first">
        {/* rails */}
        <div aria-hidden className="absolute bottom-1 left-1 top-1 w-[3px] rounded-full bg-gradient-to-b from-lime via-amber to-crimson opacity-70" />
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-lime">▲ attack-resistant</p>
        <div className="space-y-1.5">
          {TWO_FA.map((f, i) => {
            const t = toneFor(f.score);
            const on = i === sel;
            return (
              <motion.button
                key={f.name}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSel(i)}
                whileTap={{ scale: 0.98 }}
                data-ghost={GHOST[i]}
                className={cn(
                  "relative flex w-full items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan",
                  on ? "border-line-2 bg-white/[0.05]" : "border-line hover:border-line-2",
                )}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 opacity-15"
                  style={{ background: `var(--${t})` }}
                  initial={false}
                  animate={{ width: `${(f.score / 5) * 100}%` }}
                  transition={spring}
                />
                <span className="relative font-mono text-[11px] tabular-nums text-ink-3">#{i + 1}</span>
                <span className="relative min-w-0 flex-1 truncate text-sm text-ink">{f.name}</span>
                <span className="relative font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: `var(--${t})` }}>
                  {f.phish === "Yes — origin-bound" ? "Yes" : f.phish}
                </span>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-crimson">▼ phishable</p>
      </div>

      <motion.div
        key={m.name}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={spring}
        className="rounded-xl border border-line bg-void/60 p-4"
        aria-live="polite"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{m.std}</p>
        <p className="mt-1 font-display text-lg font-bold" style={{ color: `var(--${tone})` }}>
          {m.name}
        </p>
        <dl className="mt-3 space-y-2 text-[13px]">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Phishing-resistant</dt>
            <dd className="text-ink-2">{m.phish}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Main attack</dt>
            <dd className="text-ink-2">{m.attack}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Use for</dt>
            <dd className="text-ink-2">{m.use}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
          TOTP apps: Aegis (Android), Ente Auth (cross-platform, E2E sync), 2FAS. Store backup codes offline.
        </p>
      </motion.div>
    </div>
  );
}
