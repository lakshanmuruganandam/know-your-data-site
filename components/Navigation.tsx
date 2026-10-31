"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Eye, EyeOff, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { NAV } from "@/lib/nav";
import { useShadow } from "@/lib/shadow";

export function Navigation() {
  const path = usePathname();
  const { price, ghost, setGhost, setDockOpen, dockOpen } = useShadow();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > 240 && v > prev + 2 ? true : v < prev - 2 ? false : hidden);
  });

  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden && !dockOpen ? -110 : 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 24 }}
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-3"
      >
        <div className="glass flex w-full max-w-6xl items-center whitespace-nowrap gap-1 rounded-full py-1.5 pl-3 pr-1 sm:pl-4 sm:pr-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,.8)]">
          <Link href="/" className="mr-1 flex min-w-0 items-center gap-2 sm:mr-2" data-ghost="clicked logo → returning visitor score +1">
            <Logo />
            <span className="font-display text-[11px] font-extrabold tracking-tight sm:text-[13px]">
              KNOW<span className="text-cyan">/</span>YOUR<span className="text-cyan">/</span>DATA
            </span>
          </Link>

          <ul className="ml-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((l) => {
              const active = path === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    data-ghost={`nav hover '${l.label.toLowerCase()}' → interest graph updated`}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                      active ? "text-ink" : "text-ink-3 hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                    <span className={cn("relative mr-1.5", l.tone)}>{l.n}</span>
                    <span className="relative">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1 lg:ml-3">
            <button
              onClick={() => setGhost(!ghost)}
              title="Toggle the Ghost Lens (G)"
              aria-label="Toggle the ghost lens"
              aria-pressed={ghost}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors md:px-3",
                ghost ? "border-crimson/40 text-crimson" : "border-line text-ink-3",
              )}
            >
              {ghost ? <Eye size={13} /> : <EyeOff size={13} />} <span className="hidden md:inline">Lens</span>
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setDockOpen(!dockOpen)}
              data-ghost="opened own dossier → privacy-aware, bid −8%"
              className="flex items-center gap-2 rounded-full bg-crimson/10 px-2.5 py-2 sm:px-3 font-mono text-[11px] text-crimson ring-1 ring-crimson/30"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
              </span>
              <span className="hidden sm:inline">YOU&nbsp;=</span>
              <span className="tabular-nums">${price.toFixed(2)}</span>
              <span className="hidden text-crimson/60 sm:inline">CPM</span>
            </motion.button>
            <button onClick={() => setOpen(true)} className="rounded-full p-2 text-ink-2 lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-void/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button onClick={() => setOpen(false)} className="absolute right-5 top-6 p-2 text-ink-2" aria-label="Close menu">
              <X size={22} />
            </button>
            <ul className="flex h-full flex-col justify-center gap-2 px-8">
              {NAV.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={l.href} className="flex items-baseline gap-4 py-2 font-display text-4xl font-extrabold">
                    <span className={cn("font-mono text-sm", l.tone)}>{l.n}</span>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2l8 3.5v6c0 5-3.4 9-8 10.5C7.4 20.5 4 16.5 4 11.5v-6L12 2z" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="3" fill="none" stroke="var(--crimson)" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="1" fill="var(--crimson)" />
    </svg>
  );
}
