"use client";

import { motion } from "framer-motion";
import { PanelRightOpen, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Tag, toneText, type Status, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { oneIn, useShadow } from "@/lib/shadow";
import { Gauge } from "./Gauge";
import { LogConsole, type LogLine } from "./LogConsole";
import { TestRow } from "./TestRow";
import { entropyResult, exposure, RUNNERS, sleep, TESTS, toneOf, type Result, type TestId } from "./tests";

export function AuditConsole() {
  const { report, bits, fields, redacted, setDockOpen } = useShadow();
  const [results, setResults] = useState<Partial<Record<TestId, Result>>>({});
  const [active, setActive] = useState<TestId | null>(null);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<LogLine[]>([]);
  const [open, setOpen] = useState<TestId | null>(null);
  const runId = useRef(0);
  const lineId = useRef(0);
  const bitsRef = useRef(bits);
  useEffect(() => {
    bitsRef.current = bits;
  }, [bits]);

  const liveFields = fields.filter((f) => !redacted.has(f.id)).length;

  const run = useCallback(async () => {
    const id = ++runId.current;
    const alive = () => runId.current === id;
    const t0 = performance.now();
    const log = (text: string, tone?: Tone) => {
      if (!alive()) return;
      const line = { id: ++lineId.current, t: performance.now() - t0, text, tone };
      setLines((l) => [...l, line].slice(-160));
    };
    setResults({});
    setLines([]);
    setOpen(null);
    setRunning(true);
    log("kyd-audit 1.0 — client-side only · 0 bytes leave this tab", "ink");
    log(`ua: ${navigator.userAgent.slice(0, 72)}${navigator.userAgent.length > 72 ? "…" : ""}`, "ink");

    const acc: Partial<Record<TestId, Result>> = {};
    for (const meta of TESTS) {
      if (!alive()) return;
      setActive(meta.id);
      const t = performance.now();
      let res: Result;
      try {
        if (meta.id === "entropy") {
          log("> summing shadow-profile entropy…");
          await sleep(300);
          const b = bitsRef.current;
          res = entropyResult(b, oneIn(b), 0);
          log(`  ${b.toFixed(1)} bits → 1 in ${oneIn(b)}`, toneOf(res.status));
        } else {
          res = await RUNNERS[meta.id]({ log, report });
        }
      } catch (e) {
        res = { status: "warn", verdict: `Probe errored: ${e instanceof Error ? e.message : "unknown"}`, facts: [] };
      }
      const pad = 520 - (performance.now() - t);
      if (pad > 0) await sleep(pad);
      if (!alive()) return;
      acc[meta.id] = res;
      setResults((r) => ({ ...r, [meta.id]: res }));
      log(`  ↳ ${res.status.toUpperCase()}`, toneOf(res.status));
    }
    setActive(null);
    setRunning(false);
    const score = exposure(acc);
    log(`scan complete · exposure ${score}/100 · click any row for the fix`, score >= 45 ? "crimson" : "lime");
  }, [report]);

  useEffect(() => {
    const ref = runId;
    void run();
    return () => {
      ref.current++;
    };
  }, [run]);

  // entropy row stays live: redacting fields in the dock updates it
  const shown = useMemo(() => {
    if (!results.entropy) return results;
    return { ...results, entropy: entropyResult(bits, oneIn(bits), liveFields) };
  }, [results, bits, liveFields]);

  const score = exposure(shown);
  const done = Object.keys(shown).length;
  const counts = useMemo(() => {
    const c = { pass: 0, warn: 0, fail: 0 };
    for (const r of Object.values(shown)) if (r) c[r.status]++;
    return c;
  }, [shown]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-12">
      {/* ── left: sticky instrument panel ── */}
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="glass relative rounded-3xl p-5 sm:p-6">
          <span aria-hidden className="ticks pointer-events-none absolute inset-2 rounded-2xl" />
          <div className="mb-2 flex items-center justify-between gap-2">
            <Tag tone={running ? "cyan" : "lime"}>{running ? "Scan in progress" : "Scan complete"}</Tag>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">net: 0 req ext</span>
          </div>
          <Gauge score={score} running={running} done={done} total={TESTS.length} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {(["pass", "warn", "fail"] as const).map((k) => (
              <div key={k} className="rounded-xl border border-line bg-void/50 py-2">
                <div className={cn("font-display text-2xl font-extrabold tabular-nums", toneText[toneOf(k)])}>{counts[k]}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{k}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => void run()} disabled={running} tone="cyan">
              <RotateCcw size={13} className={cn(running && "animate-spin")} />
              {running ? "Scanning" : "Run scan"}
            </Button>
            <Button variant="ghost" tone="ink" onClick={() => setDockOpen(true)}>
              <PanelRightOpen size={13} />
              Shadow profile
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <LogConsole lines={lines} running={running} />
        </div>
      </aside>

      {/* ── right: test rows ── */}
      <div className="min-w-0">
        <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">Probes · {TESTS.length}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">weight → score</span>
        </div>
        <motion.ol className="space-y-3" layout>
          {TESTS.map((meta, i) => {
            const r = shown[meta.id];
            const status: Status = active === meta.id ? "scan" : r ? r.status : "idle";
            return (
              <TestRow
                key={meta.id}
                meta={meta}
                index={i}
                status={status}
                result={r}
                open={open === meta.id}
                onToggle={() => setOpen((o) => (o === meta.id ? null : meta.id))}
                extra={
                  meta.id === "entropy" && r ? (
                    <EntropyBar bits={bits} />
                  ) : undefined
                }
              />
            );
          })}
        </motion.ol>
      </div>
    </div>
  );
}

function EntropyBar({ bits }: { bits: number }) {
  const pct = Math.min(100, (bits / 40) * 100);
  const mark = (33 / 40) * 100;
  return (
    <div data-ghost="entropy ≥ 33 bits → deterministic match · cookie consent irrelevant">
      <div className="relative h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn("h-full rounded-full", bits >= 33 ? "bg-crimson" : bits >= 18 ? "bg-amber" : "bg-lime")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
        <span className="absolute inset-y-0 w-px bg-ink" style={{ left: `${mark}%` }} />
      </div>
      <div className="relative mt-1 h-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-full pr-1 text-ink-2" style={{ left: `${mark}%` }}>33 bits = unique on earth ▴</span>
        <span className="absolute right-0">40</span>
      </div>
    </div>
  );
}
