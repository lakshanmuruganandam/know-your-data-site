"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button, Source, Tag } from "@/components/ui";
import { useShadow } from "@/lib/shadow";

/* Fictional bidders — archetypes, not real companies. */
const BIDDERS = [
  { id: "dsp", name: "Demand-side platform", seg: "retail retargeting", mult: 1.0 },
  { id: "broker", name: "Data broker", seg: "buys the request, not the ad", mult: 0.55 },
  { id: "ins", name: "Insurance lead-gen", seg: "risk scoring", mult: 1.25 },
  { id: "loan", name: "Short-term lender", seg: "credit-anxious", mult: 1.45 },
  { id: "pol", name: "Political consultancy", seg: "persuadable voter", mult: 0.9 },
  { id: "unk", name: "Unknown · offshore", seg: "jurisdiction: ? · no control", mult: 0.7 },
] as const;

type Bid = { id: string; at: number; cpm: number; timeout: boolean };

const END = 100; // ms of simulated time
const BROADCAST = [8, 28] as const;
const DEADLINE = 80;

export function RtbAuction() {
  const { fields, redacted, price } = useShadow();
  const reduce = useReducedMotion();
  const [slow, setSlow] = useState(true);
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -3% 0px" });
  const started = useRef(false);

  const start = useCallback(() => {
    const b: Bid[] = BIDDERS.map((x) => {
      const at = 34 + Math.random() * 54; // some will miss the 80ms deadline
      return { id: x.id, at, cpm: Math.max(0.05, price * x.mult * (0.75 + Math.random() * 0.5)), timeout: at > DEADLINE };
    });
    if (b.every((x) => x.timeout)) b[0] = { ...b[0], at: 52, timeout: false };
    setBids(b);
    setMs(0);
    setRunning(true);
  }, [price]);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      start();
    }
  }, [inView, start]);

  useEffect(() => {
    if (!running) return;
    if (reduce) {
      setMs(END);
      setRunning(false);
      return;
    }
    const factor = slow ? 45 : 1; // 100ms → 4.5s when slowed
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const v = (now - t0) / factor;
      if (v >= END) {
        setMs(END);
        setRunning(false);
        return;
      }
      setMs(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, slow, reduce]);

  const winner = ms >= DEADLINE + 4 && bids.length ? [...bids].filter((b) => !b.timeout).sort((a, b) => b.cpm - a.cpm)[0] : undefined;
  const losers = winner ? bids.length - 1 : 0;
  const phase = ms < BROADCAST[0] ? "building bid request" : ms < BROADCAST[1] ? "broadcasting your profile" : ms < DEADLINE ? "collecting bids" : ms < END ? "highest bid wins" : bids.length ? "ad served" : "idle";
  const live = fields.filter((f) => !redacted.has(f.id)).slice(0, 7);
  const hidden = fields.filter((f) => redacted.has(f.id)).slice(0, 3);

  // geometry
  const W = 400;
  const H = 260;
  const hub = { x: W / 2, y: H / 2 };
  const nodes = BIDDERS.map((b, i) => {
    const a = (i / BIDDERS.length) * Math.PI * 2 - Math.PI / 2;
    return { ...b, x: Math.round(hub.x + Math.cos(a) * 160), y: Math.round(hub.y + Math.sin(a) * 100) };
  });
  const bProg = clamp((ms - BROADCAST[0]) / (BROADCAST[1] - BROADCAST[0]));

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="glass min-w-0 rounded-2xl p-4 sm:p-6" data-ghost="watched an auction of yourself → engagement: high · resell segment">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tag tone="crimson">Real-time bidding · one page load</Tag>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2" aria-live="off">
            <span className="text-cyan tabular-nums">{ms.toFixed(0).padStart(3, "0")}</span> / {END} ms
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={`Auction animation: your profile is broadcast to ${BIDDERS.length} bidders; ${winner ? "a winner was chosen" : phase}.`}>
          {/* deadline ring */}
          <ellipse cx={hub.x} cy={hub.y} rx={160} ry={100} fill="none" stroke="var(--line)" strokeDasharray="3 5" />
          {nodes.map((n) => {
            const bid = bids.find((b) => b.id === n.id);
            const won = winner?.id === n.id;
            const bidProg = bid && !bid.timeout ? clamp((ms - (bid.at - 14)) / 14) : 0;
            const late = bid?.timeout && ms >= DEADLINE;
            return (
              <g key={n.id}>
                <line x1={hub.x} y1={hub.y} x2={n.x} y2={n.y} stroke={won ? "var(--lime)" : "var(--line-2)"} strokeWidth={won ? 1.6 : 1} />
                {/* outgoing profile packet */}
                {bProg > 0 && bProg < 1 && <circle cx={lerp(hub.x, n.x, bProg)} cy={lerp(hub.y, n.y, bProg)} r="4" fill="var(--crimson)" style={{ filter: "drop-shadow(0 0 4px #ff3366)" }} />}
                {/* incoming bid */}
                {bidProg > 0 && bidProg < 1 && <circle cx={lerp(n.x, hub.x, bidProg)} cy={lerp(n.y, hub.y, bidProg)} r="3.5" fill="var(--amber)" />}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={won ? 15 : 12}
                  fill="var(--void)"
                  stroke={won ? "var(--lime)" : late ? "var(--ink-3)" : bProg >= 1 ? "var(--crimson)" : "var(--line-2)"}
                  strokeWidth="1.6"
                />
                <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="10" className={cn("font-mono", won ? "fill-lime" : "fill-ink-2")}>
                  {BIDDERS.findIndex((b) => b.id === n.id) + 1}
                </text>
                {bProg >= 1 && <circle cx={n.x + 10} cy={n.y - 10} r="3" fill="var(--crimson)" />}
              </g>
            );
          })}
          {/* you */}
          <circle cx={hub.x} cy={hub.y} r="24" fill="var(--void)" stroke="var(--cyan)" strokeWidth="1.6" />
          {running && <circle cx={hub.x} cy={hub.y} r={24 + (ms % 20)} fill="none" stroke="var(--cyan)" strokeOpacity={1 - (ms % 20) / 20} />}
          <text x={hub.x} y={hub.y + 4} textAnchor="middle" fontSize="11" className="fill-cyan font-mono">
            YOU
          </text>
        </svg>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
            ▸ <span className={cn(winner ? "text-lime" : "text-amber")}>{phase}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSlow((v) => !v)}
              aria-pressed={slow}
              className="rounded-full border border-line-2 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
              data-ghost="slowed time down 45× → curious about the plumbing"
            >
              {slow ? "slowed 45×" : "real time"}
            </button>
            <Button onClick={start} tone="crimson" disabled={running} className="px-4 py-1.5">
              {bids.length ? <RotateCcw size={13} /> : <Play size={13} />}
              {bids.length ? "Re-run" : "Run"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* bid request */}
        <div className="overflow-hidden rounded-xl border border-line bg-void/80" data-ghost="bid request contains your fingerprint · copied to every bidder, winner or not">
          <div className="border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">bid_request.json · sent to all {BIDDERS.length}</div>
          <pre data-lenis-prevent className="max-h-48 overflow-auto overscroll-contain p-4 font-mono text-[11.5px] leading-relaxed text-ink-2">
            {"{\n"}
            {live.map((f) => (
              <span key={f.id}>
                {"  "}
                <span className="text-cyan">&quot;{f.id}&quot;</span>: <span className="text-ink">&quot;{truncate(f.value, 26)}&quot;</span>,{"\n"}
              </span>
            ))}
            {hidden.map((f) => (
              <span key={f.id}>
                {"  "}
                <span className="text-cyan">&quot;{f.id}&quot;</span>: <span className="text-lime">null</span> <span className="text-ink-3">{"// redacted by you"}</span>,{"\n"}
              </span>
            ))}
            {"  "}
            <span className="text-cyan">&quot;floor_cpm&quot;</span>: <span className="text-amber">{price.toFixed(2)}</span>
            {"\n}"}
          </pre>
        </div>

        {/* bids */}
        <ol className="divide-y divide-line rounded-xl border border-line" aria-label="Bidders">
          {BIDDERS.map((b, i) => {
            const bid = bids.find((x) => x.id === b.id);
            const arrived = bid && !bid.timeout && bid.at <= ms;
            const late = bid?.timeout && ms >= DEADLINE;
            const won = winner?.id === b.id;
            return (
              <li key={b.id} className={cn("flex items-center gap-3 px-3.5 py-2.5 transition-colors", won && "bg-lime/[0.07]")} data-ghost={`bidder ${i + 1}: ${b.seg} · keeps your data even if it loses`}>
                <span className={cn("w-4 font-mono text-[11px]", won ? "text-lime" : "text-ink-3")}>{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-ink">{b.name}</span>
                  <span className="block truncate font-mono text-[10px] text-ink-3">{b.seg}</span>
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={won ? "w" : arrived ? "a" : late ? "l" : "p"}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn("shrink-0 font-mono text-[12px] tabular-nums", won ? "text-lime" : arrived ? "text-amber" : late ? "text-ink-3" : "text-ink-3")}
                  >
                    {won ? `WON · $${bid!.cpm.toFixed(2)}` : arrived ? `$${bid!.cpm.toFixed(2)} CPM` : late ? "timed out" : bids.length ? "…" : "—"}
                  </motion.span>
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          {winner ? (
            <>
              You sold for <span className="font-mono text-lime">${winner.cpm.toFixed(2)}</span> per thousand views — about{" "}
              <span className="font-mono text-ink">${(winner.cpm / 1000).toFixed(5)}</span> for this one. The other{" "}
              <span className="font-mono text-crimson">{losers}</span> bidders lost the auction but still received the bid request.
            </>
          ) : (
            <>
              Your illustrative floor is <span className="font-mono text-amber">${price.toFixed(2)} CPM</span>, priced from your Shadow Profile. Redact
              fields in the dock and watch the bids fall.
            </>
          )}
        </p>
        <span className="sr-only" aria-live="polite">
          {winner ? `Auction finished. Winning bid ${winner.cpm.toFixed(2)} dollars CPM.` : ""}
        </span>
      </div>
      <div className="lg:col-span-2">
        <Source>
          Mechanics simplified; bidder names are archetypes and prices are illustrative, seeded by your Shadow Profile. Scale: the Irish Council
          for Civil Liberties estimated RTB broadcasts personal data 178 trillion times a year across the US and Europe — about 376 times a day
          per European — with no control over where it flows (2022 advocacy estimate, excludes Meta and Amazon) [12, 13], via{" "}
          {"Sanka, Thakur & Nanda Salu"} (2026).
        </Source>
      </div>
    </div>
  );
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
