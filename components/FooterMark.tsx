"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** oversized outlined wordmark that slides up out of the footer as you reach the end */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["60%", "0%"]);
  const fill = useTransform(scrollYProgress, [0.5, 1], ["0%", "100%"]);
  return (
    <div ref={ref} aria-hidden className="relative overflow-hidden border-t border-line">
      <motion.div style={{ y }} className="relative select-none whitespace-nowrap px-4 py-6 text-center font-display text-[8.4vw] font-extrabold leading-[0.8] tracking-[-0.05em]">
        <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.14)]">KNOW YOUR DATA</span>
        <motion.span
          className="absolute inset-0 px-4 py-6 text-crimson/90"
          style={{ clipPath: useTransform(fill, (f) => `inset(0 calc(100% - ${f}) 0 0)`) }}
        >
          KNOW YOUR DATA
        </motion.span>
      </motion.div>
    </div>
  );
}
