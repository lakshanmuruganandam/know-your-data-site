"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Eye, EyeOff, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { spring, StatusGlyph, toneText, type Status } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toneOf, type CanvasProof, type Ip, type Result, type TestMeta } from "./tests";

const stripe: Record<Status, string> = {
  pass: "bg-lime",
  warn: "bg-amber",
  fail: "bg-crimson",
  scan: "bg-cyan",
  idle: "bg-line-2",
};

export function TestRow({
  meta,
  index,
  status,
  result,
  open,
  onToggle,
  extra,
}: {
  meta: TestMeta;
  index: number;
  status: Status;
  result?: Result;
  open: boolean;
  onToggle: () => void;
  extra?: React.ReactNode;
}) {
  const panelId = `audit-panel-${meta.id}`;
  const reduce = useReducedMotion();
  const lockTone = result ? stripe[result.status] : "bg-cyan";
  return (
    <motion.li
      layout="position"
      data-ghost={meta.ghost}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-carbon/70 transition-colors",
        status === "scan" ? "border-cyan/40 shadow-[0_0_40px_-12px_var(--cyan)]" : open ? "border-line-2" : "border-line",
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px] transition-colors duration-500", stripe[status])} />
      {status === "scan" && !reduce && (
        // scanning beam: soft wash + a hard laser edge with bloom, sweeping the row
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{ repeat: Infinity, duration: 1.4, ease: [0.45, 0, 0.55, 1] }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/10 to-cyan/20" />
          <span className="absolute inset-y-0 right-0 w-px bg-cyan shadow-[0_0_12px_2px_var(--cyan)]" />
        </motion.span>
      )}
      {status === "scan" && reduce && <span aria-hidden className="pointer-events-none absolute inset-0 bg-cyan/5" />}
      {result && !reduce && (
        // lock-in flash: the verdict lands as a tone-coloured sweep that burns off
        <motion.span
          key={result.status}
          aria-hidden
          className={cn("pointer-events-none absolute inset-y-0 left-0 w-full origin-left mix-blend-screen", lockTone)}
          initial={{ scaleX: 0, opacity: 0.22 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={!result}
        className="relative flex w-full items-start gap-3 px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan disabled:cursor-default sm:gap-4 sm:px-6 sm:py-5"
      >
        <span className="mt-1 hidden font-mono text-[11px] tracking-[0.2em] text-ink-3 sm:block">{String(index + 1).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display text-[17px] font-bold leading-tight tracking-[-0.01em] sm:text-lg">{meta.title}</span>
            {meta.heuristic && (
              <span className="rounded-full border border-amber/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-amber">heuristic</span>
            )}
          </span>
          <span className={cn("mt-1.5 block text-[14px] leading-snug", result ? toneText[toneOf(result.status)] : "font-mono text-[12px] text-ink-3")}>
            {result ? result.verdict : status === "scan" ? `probing ${meta.probe}…` : meta.probe}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <StatusGlyph status={status} size={30} />
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className={cn("text-ink-3", !result && "opacity-0")}>
            <ChevronDown size={16} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && result && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="grid gap-6 border-t border-line px-4 pb-6 pt-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <div className="min-w-0 space-y-4">
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[12px]">
                  {result.facts.map((f) => (
                    <div key={f.k} className="contents">
                      <dt className="uppercase tracking-[0.12em] text-ink-3">{f.k}</dt>
                      <dd className={cn("break-words", f.tone ? toneText[f.tone] : "text-ink")}>{f.v}</dd>
                    </div>
                  ))}
                </dl>
                {result.ips && result.ips.length > 0 && <IpList ips={result.ips} />}
                {result.canvas && <CanvasView proof={result.canvas} />}
                {extra}
                {result.note && <p className="border-l-2 border-amber/50 pl-3 text-[13px] leading-relaxed text-ink-2">{result.note}</p>}
              </div>
              <div className="min-w-0 space-y-5">
                <div>
                  <p className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-crimson">
                    <TriangleAlert size={12} /> Technical risk
                  </p>
                  <p className="text-[14px] leading-relaxed text-ink-2">{meta.risk}</p>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-lime">
                    <ShieldCheck size={12} /> 1-click fix
                  </p>
                  <ul className="space-y-2">
                    {meta.fixes.map((f) => (
                      <li key={f.where} className="rounded-lg border border-line bg-void/50 px-3 py-2 text-[13px] leading-relaxed">
                        <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">{f.where}</span>
                        <span className="text-ink-2">{f.how}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function IpList({ ips }: { ips: Ip[] }) {
  const [reveal, setReveal] = useState(false);
  const anyRaw = ips.some((i) => i.kind !== "mdns");
  return (
    <div className="rounded-xl border border-line bg-void/60 p-3" data-ghost="ice candidates logged → device graph edge · confidence 0.91">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">ICE host candidates</span>
        {anyRaw && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-pressed={reveal}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-cyan"
          >
            {reveal ? <EyeOff size={12} /> : <Eye size={12} />}
            {reveal ? "mask" : "reveal"}
          </button>
        )}
      </div>
      <ul className="space-y-1 font-mono text-[12.5px]">
        {ips.map((ip) => (
          <li key={ip.raw} className="flex items-center justify-between gap-3">
            <span className={cn("min-w-0 break-all", ip.kind === "mdns" ? "text-ink-2" : "text-crimson text-glow-crimson")}>
              {reveal || ip.kind === "mdns" ? ip.raw : ip.masked}
            </span>
            <span className={cn("shrink-0 text-[10px] uppercase tracking-[0.16em]", ip.kind === "mdns" ? "text-lime" : "text-crimson")}>{ip.kind}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CanvasView({ proof }: { proof: CanvasProof }) {
  const same = proof.ha === proof.hb;
  return (
    <div className="space-y-2" data-ghost="canvas pixels hashed → id kyd-7f3a… matched to 41 prior sessions">
      <div className="grid grid-cols-2 gap-2">
        {[
          { src: proof.a, h: proof.ha, n: "₁" },
          { src: proof.b, h: proof.hb, n: "₂" },
        ].map((c) => (
          <figure key={c.n} className="min-w-0 overflow-hidden rounded-lg border border-line bg-void">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data: URL, not a network image */}
            <img src={c.src} alt={`Canvas probe render ${c.n}`} width={260} height={72} className="block h-auto w-full" />
            <figcaption className="truncate border-t border-line px-2 py-1 font-mono text-[10.5px] text-cyan">
              h{c.n} {c.h}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="font-mono text-[11px] text-ink-3">
        h₁ {same ? "==" : "≠"} h₂ · prev {proof.prev ? <span className={proof.prev === proof.hb ? "text-crimson" : "text-lime"}>{proof.prev}</span> : "—"}
      </p>
    </div>
  );
}
