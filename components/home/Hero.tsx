"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ScanLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { ShaderField } from "@/components/home/ShaderField";
import { Button, Tag, ease } from "@/components/ui";
import { useShadow } from "@/lib/shadow";

type Bit = { t: string; hot?: boolean };

export function Hero() {
  const { fields, price, setDockOpen } = useShadow();
  const [stats, setStats] = useState({ blocked: 0, leaked: 0 });
  const onStats = useCallback((s: { blocked: number; leaked: number }) => setStats(s), []);

  // a narrative assembled from the visitor's own browser, typed out
  const script = useMemo<Bit[]>(() => {
    const v = (id: string) => fields.find((f) => f.id === id)?.value;
    if (!fields.length) return [];
    const tz = v("timezone")?.split(" ")[0] ?? "";
    const city = tz.split("/").pop()?.replace(/_/g, " ") ?? "somewhere";
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const plat = v("platform")?.split(" · ")[0] ?? "your device";
    return [
      { t: "You're near " },
      { t: city, hot: true },
      { t: ". It's " },
      { t: now, hot: true },
      { t: " for you. You're on " },
      { t: plat, hot: true },
      { t: " with a " },
      { t: v("gpu") ?? "GPU", hot: true },
      { t: ", a " },
      { t: v("screen") ?? "screen", hot: true },
      { t: " display, reading in " },
      { t: v("language")?.split(", ")[0] ?? "—", hot: true },
      { t: ". Your browser draws pixels with signature " },
      { t: v("canvas") ?? "…", hot: true },
      { t: ". You told us none of this." },
    ];
  }, [fields]);

  const total = script.reduce((a, b) => a + b.t.length, 0);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!total) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total);
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= total) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [total]);

  let left = n;
  const typed = script.map((b, i) => {
    const take = Math.max(0, Math.min(b.t.length, left));
    left -= take;
    if (!take) return null;
    const s = b.t.slice(0, take);
    return b.hot ? (
      <span key={i} className="rounded bg-crimson/10 px-1 text-crimson" data-ghost="you read your own data → high engagement, keep them here">
        {s}
      </span>
    ) : (
      <span key={i}>{s}</span>
    );
  });

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <ShaderField />
      <HeroCanvas onStats={onStats} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_18%_45%,rgba(7,8,11,.92)_0%,rgba(7,8,11,.6)_40%,rgba(7,8,11,.12)_70%,transparent_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-void/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-24 pt-32 sm:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Tag tone="crimson">Live · Millennium Fellowship 2026 · IIT Delhi Abu Dhabi</Tag>
        </motion.div>

        <h1 className="mt-7 max-w-4xl font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold leading-[0.86] tracking-[-0.045em]">
          {["The web", "already", "knows you."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={i === 1 ? "inline-block font-serif font-normal italic tracking-[-0.02em] text-crimson text-glow-crimson" : "inline-block"}
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.12, duration: 1, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease }}
          className="glass ticks mt-10 max-w-xl rounded-xl p-5"
          data-ghost="read dossier panel → curiosity score 0.91"
        >
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
            <span className="flex items-center gap-2 text-crimson">
              <ScanLine size={12} /> profile compiled in-tab
            </span>
            <span>0 cookies used</span>
          </div>
          <p className="min-h-[6.5em] font-mono text-[13.5px] leading-relaxed text-ink-2">
            {typed}
            <span className="blink ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-crimson" />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3 font-mono text-[11px]">
            <span className="text-ink-3">
              est. bid for you <span className="text-crimson tabular-nums">${price.toFixed(2)} CPM</span>
            </span>
            <span className="text-ink-3">
              shield blocked <span className="text-cyan tabular-nums">{stats.blocked}</span> · leaked <span className="text-amber tabular-nums">{stats.leaked}</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button href="/audit">
            <ScanLine size={14} /> Run the live audit
          </Button>
          <Button variant="ghost" tone="crimson" onClick={() => setDockOpen(true)}>
            Open your shadow profile
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-10 hidden max-w-md items-center gap-2 font-mono text-[11px] leading-relaxed text-ink-3 md:flex"
        >
          <ArrowDownRight size={14} className="shrink-0 text-cyan" />
          Your cursor is a shield — and a lens. Move it over anything to see what a tracker would log. Press G to toggle.
        </motion.p>
      </div>
    </section>
  );
}
