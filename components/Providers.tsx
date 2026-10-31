"use client";

import Lenis from "lenis";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Intro } from "@/components/Intro";
import { ShadowProvider } from "@/lib/shadow";

const IntroCtx = createContext(true);
/** false while the cold open is still covering the page */
export const useIntroDone = () => useContext(IntroCtx);

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [introDone, setIntroDone] = useState(false);
  const done = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <ShadowProvider>
      <IntroCtx.Provider value={introDone}>
        <ScrollProgress />
        {children}
        <Intro onDone={done} />
      </IntroCtx.Provider>
    </ShadowProvider>
  );
}

/** main content: re-mounts once the cold open ends so entrance animations play in view */
export function Stage({ children }: { children: React.ReactNode }) {
  const introDone = useIntroDone();
  return (
    <main key={introDone ? "live" : "pre"} className="relative">
      {children}
    </main>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[58] h-[2px] origin-left bg-gradient-to-r from-crimson via-amber to-cyan"
      style={{ scaleX: x }}
    />
  );
}
