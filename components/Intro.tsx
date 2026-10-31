"use client";

/**
 * Cold open. Plays once per session: a terminal "acquires" the visitor,
 * types their real fingerprint, flashes SUBJECT IDENTIFIED, then the screen
 * tears open in shutters. Click / any key skips.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { oneIn, useShadow } from "@/lib/shadow";

const KEY = "kyd.intro.v1";
const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEF▓▒░";

export function Intro({ onDone }: { onDone: () => void }) {
  const { fields, bits } = useShadow();
  const [phase, setPhase] = useState<"check" | "boot" | "type" | "lock" | "out" | "gone">("check");
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    setPhase("out");
    setTimeout(() => {
      setPhase("gone");
    }, 1100);
    // reveal the page underneath while the shutters open
    setTimeout(onDone, 120);
  };

  // decide whether to play
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current = true;
      setPhase("gone");
      onDone();
      return;
    }
    setPhase("boot");
    const t = setTimeout(() => setPhase("type"), 900);
    return () => clearTimeout(t);
  }, [onDone]);

  // type the dossier lines
  useEffect(() => {
    if (phase !== "type" || !fields.length) return;
    if (shown >= fields.length) {
      const t = setTimeout(() => setPhase("lock"), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), 170);
    return () => clearTimeout(t);
  }, [phase, shown, fields.length]);

  useEffect(() => {
    if (phase !== "lock") return;
    const t = setTimeout(finish, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // skip
  useEffect(() => {
    if (phase === "gone" || phase === "check" || phase === "out") return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "gone") return null;

  const SHUTTERS = 7;
  return (
    <div id="kyd-intro" className="fixed inset-0 z-[100]" onClick={phase !== "out" ? finish : undefined} aria-hidden={phase === "out"}>
      {/* shutters: the black screen is made of bars that tear away */}
      {Array.from({ length: SHUTTERS }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 bg-void"
          style={{ top: `${(i / SHUTTERS) * 100}%`, height: `${100 / SHUTTERS + 0.4}%` }}
          initial={false}
          animate={phase === "out" ? { x: i % 2 ? "102%" : "-102%" } : { x: 0 }}
          transition={{ duration: 0.85, delay: Math.abs(i - (SHUTTERS - 1) / 2) * 0.05, ease: [0.76, 0, 0.24, 1] }}
        >
          {phase === "out" && <div className={`absolute inset-y-0 w-[2px] bg-crimson shadow-[0_0_20px_var(--crimson)] ${i % 2 ? "left-0" : "right-0"}`} />}
        </motion.div>
      ))}

      <AnimatePresence>
        {phase !== "out" && phase !== "check" && (
          <motion.div className="absolute inset-0 flex items-center justify-center px-6" exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }} transition={{ duration: 0.35 }}>
            <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
            {/* sweeping scan beam */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-crimson/10 to-transparent"
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            {/* corner HUD */}
            <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3">kyd://ghost-layer · v2026</div>
            <div className="absolute right-5 top-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-crimson">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson" /> rec
            </div>
            <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3">
              <span className="sm:hidden">tap to skip</span>
              <span className="hidden sm:inline">click or press any key to skip</span>
            </div>
            <div className="absolute bottom-5 right-5 hidden font-mono sm:block text-[10px] uppercase tracking-[0.25em] text-ink-3">0 cookies · 0 requests</div>

            <div className="relative w-full max-w-2xl">
              {phase === "lock" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <motion.div
                    initial={{ scale: 1.6, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block border-2 border-crimson px-5 py-3 font-display text-[clamp(1.8rem,6vw,4rem)] font-extrabold uppercase leading-none tracking-tight text-crimson text-glow-crimson"
                  >
                    <Scramble text="Subject identified" />
                  </motion.div>
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 font-mono text-sm text-ink-2">
                    {bits.toFixed(1)} bits · 1 in {oneIn(bits)} browsers · no cookie required
                  </motion.p>
                </motion.div>
              ) : (
                <div className="font-mono text-[12.5px] leading-[1.9] sm:text-sm">
                  <div className="text-ink-3">
                    &gt; establishing passive fingerprint<span className="blink">_</span>
                  </div>
                  {phase === "type" &&
                    fields.slice(0, shown).map((f) => (
                      <motion.div key={f.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 overflow-hidden whitespace-nowrap">
                        <span className="w-28 shrink-0 text-ink-3 sm:w-36">{f.label.toLowerCase()}</span>
                        <span className="truncate text-crimson">
                          <Scramble text={f.value} />
                        </span>
                        <span className="ml-auto hidden shrink-0 text-lime/80 sm:inline">+{f.bits}b</span>
                      </motion.div>
                    ))}
                  <div className="mt-4 h-px w-full overflow-hidden bg-line">
                    <motion.div className="h-full bg-crimson" animate={{ width: `${fields.length ? (shown / fields.length) * 100 : 8}%` }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** text that resolves out of random glyphs */
export function Scramble({ text, duration = 520 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const fixed = Math.floor(p * text.length);
      let out = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);
  return (
    <span ref={ref} aria-label={text}>
      {text}
    </span>
  );
}
