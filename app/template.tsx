"use client";

/**
 * Route transition: every navigation is a cut. Redaction bars cover the
 * frame, a chapter card names the module, then the bars tear away.
 * Skipped on the very first load (the cold open handles that).
 */

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";

// the wipe plays only when the route actually changes (not on first load or re-mounts)
let lastPath: string | null = null;
const BARS = 6;

export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [play] = useState(() => lastPath !== null && lastPath !== path);
  useEffect(() => {
    lastPath = path;
  }, [path]);

  const item = NAV.find((n) => n.href === path);
  const label = item ? `${item.n} — ${item.label}` : "00 — Index";

  return (
    <>
      {play && !reduce && (
        <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden>
          {Array.from({ length: BARS }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 bg-void"
              style={{ top: `${(i / BARS) * 100}%`, height: `${100 / BARS + 0.5}%`, originX: i % 2 ? 0 : 1 }}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 0.7, delay: 0.38 + i * 0.045, ease: [0.76, 0, 0.24, 1] }}
            >
              <div className={`absolute inset-y-0 w-px bg-crimson/80 ${i % 2 ? "right-0" : "left-0"}`} />
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.32 }}
          >
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-crimson">declassifying</div>
              <motion.div
                className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight text-ink sm:text-6xl"
                initial={{ letterSpacing: "0.3em", opacity: 0, filter: "blur(6px)" }}
                animate={{ letterSpacing: "-0.02em", opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {label}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      <motion.div
        initial={play && !reduce ? { opacity: 0, y: 30, scale: 0.985, filter: "blur(6px)" } : false}
        // filter/transform would make this a containing block for fixed dialogs — clear them once settled
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
