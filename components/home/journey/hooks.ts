"use client";

import { useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, type RefObject } from "react";

/** 0→1 progress of `p` across [a, b], clamped */
export function useSeg(p: MotionValue<number>, a: number, b: number) {
  return useTransform(p, [a, b], [0, 1]);
}

/** element size as motion values (no React re-render on resize) */
export function useBox<T extends HTMLElement>(): { ref: RefObject<T | null>; w: MotionValue<number>; h: MotionValue<number> } {
  const ref = useRef<T>(null);
  const w = useMotionValue(1000);
  const h = useMotionValue(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => {
      w.set(el.clientWidth || 1000);
      h.set(el.clientHeight || 640);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return { ref, w, h };
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** local 0..1 inside [a, b] */
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - (1 - x) ** 3;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
