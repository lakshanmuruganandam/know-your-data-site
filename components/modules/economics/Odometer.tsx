"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const LH = 1.15; // em — one digit cell

/**
 * Mechanical odometer: every digit is a 0–9 drum that rolls (with a little spring overshoot)
 * to its new value; separators and units stay static. Drums are keyed from the right so the
 * ones column keeps its identity when the number grows a digit.
 */
export function Odometer({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const chars = value.split("");
  return (
    <span className={cn("relative inline-flex items-baseline", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((ch, i) => {
          const key = chars.length - i;
          const d = DIGITS.indexOf(ch);
          if (d < 0) {
            return (
              <span key={`s${key}-${ch}`} className="inline-block whitespace-pre" style={{ height: `${LH}em`, lineHeight: `${LH}em` }}>
                {ch}
              </span>
            );
          }
          return (
            <span key={`d${key}`} className="relative inline-block overflow-hidden" style={{ height: `${LH}em`, lineHeight: `${LH}em` }}>
              {/* invisible sizer keeps the drum exactly one glyph wide */}
              <span className="invisible">{ch}</span>
              <motion.span
                className="absolute left-0 top-0 flex flex-col"
                initial={false}
                animate={{ y: `${-d * LH}em` }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 19, mass: 0.7 }}
              >
                {DIGITS.map((g) => (
                  <span key={g} style={{ height: `${LH}em` }}>
                    {g}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
