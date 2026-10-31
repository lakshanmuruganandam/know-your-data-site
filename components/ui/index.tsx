"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { Check, Copy, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const spring = { type: "spring", stiffness: 260, damping: 26 } as const;
export const ease = [0.22, 1, 0.36, 1] as const;

/* ── mono HUD label: "// 03 — ECONOMICS" ── */
export function Tag({ children, tone = "cyan", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em]", toneText[tone], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", toneBg[tone])} />
      {children}
    </span>
  );
}

export type Tone = "cyan" | "lime" | "amber" | "crimson" | "ink";
export const toneText: Record<Tone, string> = {
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  crimson: "text-crimson",
  ink: "text-ink-2",
};
export const toneBg: Record<Tone, string> = {
  cyan: "bg-cyan",
  lime: "bg-lime",
  amber: "bg-amber",
  crimson: "bg-crimson",
  ink: "bg-ink-2",
};
export const toneBorder: Record<Tone, string> = {
  cyan: "border-cyan/40",
  lime: "border-lime/40",
  amber: "border-amber/40",
  crimson: "border-crimson/40",
  ink: "border-line-2",
};

/* ── Redacted: text sits under a black bar that slides away on view ── */
export function Redacted({ children, delay = 0, className, bar = "bg-ink" }: { children: ReactNode; delay?: number; className?: string; bar?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.35, duration: 0.01 }}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className={cn("absolute inset-y-[8%] left-0 right-0 origin-right", bar)}
        initial={{ scaleX: 0, originX: 0 }}
        animate={inView ? { scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] } : {}}
        transition={{ delay, duration: 0.9, times: [0, 0.4, 0.5, 1], ease }}
      />
    </span>
  );
}

/* ── Page header used by every module page ── */
export function PageHeader({ index, kicker, title, accent, lede, tone = "cyan" }: { index: string; kicker: string; title: string; accent?: string; lede: ReactNode; tone?: Tone }) {
  return (
    <header className="relative mx-auto max-w-7xl px-4 pb-14 pt-36 sm:px-8 md:pt-44">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <Tag tone={tone}>
        {index} — {kicker}
      </Tag>
      <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.6rem,7vw,6.2rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">
        <Redacted>{title}</Redacted>
        {accent && (
          <>
            {" "}
            <Redacted delay={0.15} className={cn("font-serif font-normal italic tracking-normal", toneText[tone])}>
              {accent}
            </Redacted>
          </>
        )}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease }}
        className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2"
      >
        {lede}
      </motion.p>
    </header>
  );
}

/* ── Section wrapper ── */
export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-4 py-16 sm:px-8", className)}>
      {children}
    </section>
  );
}

/* ── Reveal on scroll (stagger children by passing index) ── */
export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ delay: i * 0.06, duration: 0.8, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Glass card ── */
export function Card({ children, className, hover = true, ghost }: { children: ReactNode; className?: string; hover?: boolean; ghost?: string }) {
  return (
    <div data-ghost={ghost} className={cn("glass rounded-2xl", hover && "glass-hover", className)}>
      {children}
    </div>
  );
}

/* ── Animated number counter ── */
export function Counter({ to, from = 0, decimals = 0, prefix = "", suffix = "", duration = 1.8, className }: { to: number; from?: number; decimals?: number; prefix?: string; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(from);
  const text = useTransform(mv, (v) => prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration, ease });
    return () => c.stop();
  }, [inView, to, duration, mv]);
  return <motion.span ref={ref} className={cn("tabular-nums", className)}>{text}</motion.span>;
}

/* ── Status glyph: pass / warn / fail / scanning ── */
export type Status = "pass" | "warn" | "fail" | "scan" | "idle";
export function StatusGlyph({ status, size = 28 }: { status: Status; size?: number }) {
  const color = { pass: "var(--lime)", warn: "var(--amber)", fail: "var(--crimson)", scan: "var(--cyan)", idle: "var(--ink-3)" }[status];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-label={status} role="img">
      <circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeOpacity=".25" strokeWidth="2" />
      {status === "scan" ? (
        <motion.circle
          cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="22 66"
          animate={{ rotate: 360 }} style={{ originX: "16px", originY: "16px" }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      ) : (
        <motion.circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease }} />
      )}
      {status === "pass" && <motion.path d="M10 16.5l4 4 8-9" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />}
      {status === "fail" && <motion.path d="M11 11l10 10M21 11L11 21" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />}
      {status === "warn" && <motion.path d="M16 9v9M16 22.5v.5" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />}
      {status === "idle" && <circle cx="16" cy="16" r="2" fill={color} />}
    </svg>
  );
}

/* ── Buttons: glowing trace + tactile press ── */
export function Button({ children, onClick, href, tone = "cyan", variant = "solid", className, type = "button", disabled }: { children: ReactNode; onClick?: () => void; href?: string; tone?: Tone; variant?: "solid" | "ghost"; className?: string; type?: "button" | "submit"; disabled?: boolean }) {
  const cls = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors disabled:opacity-40",
    variant === "solid" ? cn(toneBg[tone], "text-void hover:brightness-110") : cn("border", toneBorder[tone], toneText[tone], "hover:bg-white/5"),
    className,
  );
  const inner = (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {children}
    </>
  );
  if (href)
    return (
      <motion.span whileTap={{ scale: 0.97 }} className="inline-flex">
        <Link href={href} className={cls}>{inner}</Link>
      </motion.span>
    );
  return (
    <motion.button type={type} whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </motion.button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? "Copied" : label}
    </Button>
  );
}

export function DownloadButton({ text, filename, label = "Download .txt" }: { text: string; filename: string; label?: string }) {
  return (
    <Button
      variant="ghost"
      tone="lime"
      onClick={() => {
        const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
        const a = Object.assign(document.createElement("a"), { href: url, download: filename });
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={14} />
      {label}
    </Button>
  );
}

/* ── Code block with copy ── */
export function Code({ code, lang = "bash", title }: { code: string; lang?: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-void/80">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">{title ?? lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-ink-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Source footnote ── */
export function Source({ children }: { children: ReactNode }) {
  return <p className="mt-3 font-mono text-[10.5px] leading-relaxed tracking-wide text-ink-3">SRC ▸ {children}</p>;
}
