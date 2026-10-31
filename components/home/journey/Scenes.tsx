"use client";

import { motion, useMotionValue, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { BASE_CPM } from "@/lib/shadow";
import { cn } from "@/lib/cn";
import { useBox, easeInOut, easeOut, win } from "./hooks";
import { BIDDERS, WINNER, pixelLines, prng, r2, type Packet } from "./model";

type MV = MotionValue<number>;
type SceneProps = { t: MV; packets: Packet[]; price: number };

/** absolutely positioned, centred on the parent's midpoint + (x, y) px */
function At({ x, y, children, className, style }: { x: MV | number; y: MV | number; children: ReactNode; className?: string; style?: MotionStyle }) {
  return (
    <motion.div className={cn("absolute left-1/2 top-1/2", className)} style={{ x, y, ...style }}>
      <div className="-translate-x-1/2 -translate-y-1/2">{children}</div>
    </motion.div>
  );
}

function Chip({ p, tone = "cyan", className }: { p: Packet; tone?: "cyan" | "crimson"; className?: string }) {
  return (
    <div
      data-ghost={`${p.label} lifted → ${p.inference}`.slice(0, 88)}
      className={cn(
        "w-max max-w-[118px] rounded-md border bg-void/85 px-2 py-1.5 backdrop-blur-sm sm:max-w-[210px]",
        tone === "cyan" ? "border-cyan/40 shadow-[0_0_28px_-6px_rgba(0,242,254,.45)]" : "border-crimson/50 shadow-[0_0_28px_-6px_rgba(255,51,102,.5)]",
        className,
      )}
    >
      <div className={cn("font-mono text-[8.5px] uppercase tracking-[0.2em] sm:text-[10px]", tone === "cyan" ? "text-cyan" : "text-crimson")}>{p.label}</div>
      <div className="truncate font-mono text-[10px] text-ink sm:text-[12px]">{p.value}</div>
    </div>
  );
}

/* where packet i ends up after peeling off the link (px from centre) */
function ring(i: number, n: number, w: number, h: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.35;
  const rx = Math.max(90, Math.min(w * 0.5 - 70, 400));
  const ry = Math.min(h * 0.4, 230);
  return { x: Math.cos(a) * rx, y: Math.sin(a) * ry };
}

/* ────────────────────────── 01 · THE CLICK ────────────────────────── */

function PeelPacket({ p, i, n, t, w, h }: { p: Packet; i: number; n: number; t: MV; w: MV; h: MV }) {
  const k = useTransform(() => easeOut(win(t.get(), 0.55 + i * 0.035, 0.8 + i * 0.025)));
  const x = useTransform(() => ring(i, n, w.get(), h.get()).x * k.get());
  const y = useTransform(() => ring(i, n, w.get(), h.get()).y * k.get());
  const opacity = useTransform(k, [0, 0.15, 1], [0, 1, 1]);
  const scale = useTransform(k, [0, 1], [0.3, 1]);
  return (
    <At x={x} y={y} style={{ opacity, scale }} className="z-10">
      <Chip p={p} />
    </At>
  );
}

function Tether({ i, n, t, w, h }: { i: number; n: number; t: MV; w: MV; h: MV }) {
  const k = useTransform(() => easeOut(win(t.get(), 0.55 + i * 0.035, 0.8 + i * 0.025)));
  const x1 = useTransform(() => w.get() / 2);
  const y1 = useTransform(() => h.get() / 2);
  const x2 = useTransform(() => w.get() / 2 + ring(i, n, w.get(), h.get()).x * k.get());
  const y2 = useTransform(() => h.get() / 2 + ring(i, n, w.get(), h.get()).y * k.get());
  const opacity = useTransform(k, [0, 0.1, 1], [0, 0.6, 0.35]);
  return <motion.line x1={x1} y1={y1} x2={x2} y2={y2} style={{ opacity }} stroke="var(--cyan)" strokeWidth={1} strokeDasharray="3 5" />;
}

export function SceneClick({ t, packets }: SceneProps) {
  const { ref, w, h } = useBox<HTMLDivElement>();
  const frameO = useTransform(t, [0.08, 0.24], [0, 1]);
  const frameS = useTransform(t, [0.08, 0.3], [0.94, 1]);
  const cx = useTransform(() => (1 - easeInOut(win(t.get(), 0.2, 0.46))) * Math.min(w.get() * 0.34, 280) - 4);
  const cy = useTransform(() => (1 - easeInOut(win(t.get(), 0.2, 0.46))) * Math.min(h.get() * 0.32, 200) - 2);
  const cS = useTransform(t, [0.46, 0.49, 0.53], [1, 0.78, 1]);
  const cO = useTransform(t, [0.16, 0.22, 0.86, 0.96], [0, 1, 1, 0.3]);
  const linkS = useTransform(t, [0.46, 0.49, 0.54], [1, 0.94, 1]);
  const linkGlow = useTransform(t, [0.46, 0.5, 0.8], [0, 1, 0.25]);
  const r1S = useTransform(t, [0.47, 0.78], [0.2, 9]);
  const r1O = useTransform(t, [0.47, 0.5, 0.78], [0, 0.85, 0]);
  const r2S = useTransform(t, [0.52, 0.86], [0.2, 12]);
  const r2O = useTransform(t, [0.52, 0.55, 0.86], [0, 0.6, 0]);
  return (
    <div ref={ref} className="absolute inset-0">
      {/* the page you meant to read */}
      <motion.div
        style={{ opacity: frameO, scale: frameS }}
        className="absolute left-1/2 top-1/2 h-[min(78%,340px)] w-[min(560px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line-2 bg-carbon/70"
        data-ghost="page view logged before first paint · referrer + scroll depth queued"
      >
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-crimson/70" />
          <span className="h-2 w-2 rounded-full bg-amber/70" />
          <span className="h-2 w-2 rounded-full bg-lime/70" />
          <span className="ml-3 truncate rounded-full bg-zinc px-3 py-0.5 font-mono text-[10px] text-ink-3">news.example/story</span>
        </div>
        <div className="space-y-2.5 p-5">
          <div className="h-3 w-3/4 rounded bg-zinc-2" />
          <div className="h-2 w-full rounded bg-zinc" />
          <div className="h-2 w-5/6 rounded bg-zinc" />
          <div className="h-2 w-2/3 rounded bg-zinc" />
        </div>
      </motion.div>
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {packets.map((p, i) => (
          <Tether key={p.id} i={i} n={packets.length} t={t} w={w} h={h} />
        ))}
      </svg>
      {/* ripples */}
      <At x={0} y={0}>
        <div className="relative h-10 w-10">
          <motion.span style={{ scale: r1S, opacity: r1O }} className="absolute inset-0 rounded-full border border-cyan" />
          <motion.span style={{ scale: r2S, opacity: r2O }} className="absolute inset-0 rounded-full border border-cyan/60" />
        </div>
      </At>
      {/* the link */}
      <At x={0} y={0} style={{ scale: linkS }} className="z-10">
        <div className="relative">
          <motion.span style={{ opacity: linkGlow }} className="absolute -inset-3 rounded-full bg-cyan/25 blur-xl" />
          <span className="relative block whitespace-nowrap rounded-full border border-cyan/50 bg-void px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan sm:text-[12px]">
            Read the full story →
          </span>
        </div>
      </At>
      {packets.map((p, i) => (
        <PeelPacket key={p.id} p={p} i={i} n={packets.length} t={t} w={w} h={h} />
      ))}
      {/* cursor (tip anchored at the link centre) */}
      <motion.div className="absolute left-1/2 top-1/2 z-20 text-ink" style={{ x: cx, y: cy, scale: cS, opacity: cO, originX: 0, originY: 0 }}>
        <MousePointer2 size={30} strokeWidth={1.5} className="fill-ink/90 drop-shadow-[0_4px_12px_rgba(0,0,0,.8)]" />
      </motion.div>
    </div>
  );
}

/* ────────────────────────── 02 · THE PIXEL ────────────────────────── */

function Converge({ p, i, n, t, w, h }: { p: Packet; i: number; n: number; t: MV; w: MV; h: MV }) {
  const k = useTransform(() => easeInOut(win(t.get(), 0.02 + i * 0.015, 0.2 + i * 0.012)));
  const x = useTransform(() => ring(i, n, w.get(), h.get()).x * (1 - k.get()));
  const y = useTransform(() => ring(i, n, w.get(), h.get()).y * (1 - k.get()));
  const opacity = useTransform(k, [0, 0.8, 1], [1, 0.8, 0]);
  const scale = useTransform(k, [0, 1], [1, 0.15]);
  return (
    <At x={x} y={y} style={{ opacity, scale }}>
      <Chip p={p} />
    </At>
  );
}

function ParamLine({ line, i, t }: { line: string; i: number; t: MV }) {
  const s = 0.48 + i * 0.035;
  const k = useTransform(t, [s, s + 0.05], [0, 100]);
  const clipPath = useTransform(k, (v) => `inset(0 ${100 - v}% 0 0)`);
  const opacity = useTransform(t, [s - 0.005, s], [0, 1]);
  const m = line.match(/^(\s*[?&])([^=]+)=(.*)$/);
  const tail = line.startsWith("←");
  return (
    <motion.div style={{ clipPath, opacity }} className="truncate whitespace-pre leading-[1.65]">
      {m ? (
        <>
          <span className="text-ink-3">{m[1]}</span>
          <span className="text-cyan">{m[2]}</span>
          <span className="text-ink-3">=</span>
          <span className="text-ink">{m[3]}</span>
        </>
      ) : (
        <span className={tail ? "text-lime" : "text-ink-2"}>{line}</span>
      )}
    </motion.div>
  );
}

export function ScenePixel({ t, packets }: SceneProps) {
  const { ref, w, h } = useBox<HTMLDivElement>();
  const lines = useMemo(() => pixelLines(packets), [packets]);
  const dotO = useTransform(t, [0.1, 0.18, 0.27, 0.3], [0, 1, 1, 0]);
  const pulse = useTransform(t, [0.14, 0.27], [0.5, 3]);
  const pulseO = useTransform(t, [0.14, 0.18, 0.27], [0, 0.8, 0]);
  const panelS = useTransform(() => 0.006 + 0.994 * easeInOut(win(t.get(), 0.27, 0.47)));
  const panelO = useTransform(t, [0.26, 0.275], [0, 1]);
  const metaO = useTransform(t, [0.42, 0.48], [0, 1]);
  return (
    <div ref={ref} className="absolute inset-0">
      {packets.map((p, i) => (
        <Converge key={p.id} p={p} i={i} n={packets.length} t={t} w={w} h={h} />
      ))}
      {/* the 1×1 pixel itself */}
      <At x={0} y={0} style={{ opacity: dotO }}>
        <div className="relative flex items-center">
          <motion.span style={{ scale: pulse, opacity: pulseO }} className="absolute -left-3 -top-3 h-7 w-7 rounded-full border border-cyan" />
          <span className="block h-[3px] w-[3px] bg-cyan shadow-[0_0_12px_3px_rgba(0,242,254,.7)]" />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
            ← 1×1 px · transparent gif
          </span>
        </div>
      </At>
      {/* …blown up until it fills the frame */}
      <motion.div
        style={{ scale: panelS, opacity: panelO }}
        className="absolute left-1/2 top-1/2 flex h-[min(92%,460px)] w-[min(880px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-cyan/40 bg-black shadow-[0_0_80px_-20px_rgba(0,242,254,.5)]"
        data-ghost="tracking pixel · the image is the excuse, the URL is the payload"
      >
        <motion.div style={{ opacity: metaO }} className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-3 sm:px-4 sm:text-[10.5px]">
          <span className="truncate">network · 1 request · p.gif</span>
          <span className="shrink-0 text-cyan">illustrative · built from your values</span>
        </motion.div>
        <div className="flex-1 overflow-hidden p-3 font-mono text-[10px] sm:p-5 sm:text-[13px]">
          {lines.map((l, i) => (
            <ParamLine key={i} line={l} i={i} t={t} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────── 03 · THE AUCTION ────────────────────────── */

const R = 270;
const NODES = BIDDERS.map((b, i) => {
  const a = (i / BIDDERS.length) * Math.PI * 2 - Math.PI / 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { ...b, i, c: r2(c), s: r2(s), x: r2(c * R), y: r2(s * R) };
});

function Bidder({ n, t, price }: { n: (typeof NODES)[number]; t: MV; price: number }) {
  const win_ = n.i === WINNER;
  const ray = useTransform(t, [0.16 + n.i * 0.012, 0.32 + n.i * 0.012], [0, 1]);
  const pk = useTransform(t, [0.2 + n.i * 0.01, 0.38 + n.i * 0.01], [0, 1]);
  const pkx = useTransform(pk, (v) => r2(n.x * v));
  const pky = useTransform(pk, (v) => r2(n.y * v));
  const pkO = useTransform(pk, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const bid = useTransform(t, [0.4 + n.i * 0.014, 0.6 + n.i * 0.01], [0, 1]);
  const bidO = useTransform(bid, [0, 0.2], [0, 1]);
  const dim = useTransform(t, [0.66, 0.72], [1, win_ ? 1 : 0.28]);
  const nodeR = useTransform(t, [0.66, 0.72], [9, win_ ? 17 : 9]);
  const len = 30 + n.bid * 110;
  const anchor = n.c > 0.3 ? "start" : n.c < -0.3 ? "end" : "middle";
  const lx = r2(n.x + n.c * 24);
  const ly = r2(n.y + n.s * 24 + (Math.abs(n.c) <= 0.3 ? (n.s > 0 ? 14 : -4) : 7));
  return (
    <motion.g style={{ opacity: dim }}>
      <motion.line x1={0} y1={0} x2={n.x} y2={n.y} stroke="var(--line-2)" strokeWidth={1.5} style={{ pathLength: ray }} />
      <motion.circle cx={pkx} cy={pky} r={5} fill="var(--cyan)" style={{ opacity: pkO }} />
      {/* bid bar grows inward from the bidder */}
      <motion.line
        x1={n.x}
        y1={n.y}
        x2={r2(n.x - n.c * len)}
        y2={r2(n.y - n.s * len)}
        stroke={win_ ? "var(--crimson)" : "var(--amber)"}
        strokeOpacity={win_ ? 1 : 0.75}
        strokeWidth={win_ ? 13 : 9}
        strokeLinecap="round"
        style={{ pathLength: bid, opacity: bidO }}
      />
      <motion.circle cx={n.x} cy={n.y} r={nodeR} fill={win_ ? "var(--crimson)" : "var(--zinc-2)"} stroke={win_ ? "var(--crimson)" : "var(--ink-3)"} strokeWidth={1.5} />
      <text x={lx} y={ly} textAnchor={anchor} className="fill-ink-2 font-mono" fontSize={20}>
        {n.name}
      </text>
      <motion.text x={lx} y={ly + 22} textAnchor={anchor} className={cn("font-mono", win_ ? "fill-crimson" : "fill-amber")} fontSize={17} style={{ opacity: bidO }}>
        {`$${(price * n.bid).toFixed(2)}`}
      </motion.text>
    </motion.g>
  );
}

export function SceneAuction({ t, price }: SceneProps) {
  const cam = useTransform(() => 2.5 - 1.5 * easeOut(win(t.get(), 0, 0.34)));
  const flashR = useTransform(t, [0.68, 0.86], [0, 160]);
  const flashO = useTransform(t, [0.68, 0.7, 0.86], [0, 0.9, 0]);
  const resO = useTransform(t, [0.72, 0.8], [0, 1]);
  const resY = useTransform(t, [0.72, 0.8], [16, 0]);
  const w = NODES[WINNER];
  return (
    <div className="absolute inset-0" data-ghost="bid request broadcast · every bidder got a copy · winner or not">
      <motion.div style={{ scale: cam }} className="absolute inset-0">
        <svg aria-hidden viewBox="-470 -400 940 800" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
          <circle r={R} fill="none" stroke="var(--line)" strokeDasharray="2 8" />
          <circle r={R * 0.62} fill="none" stroke="var(--line)" />
          {NODES.map((n) => (
            <Bidder key={n.i} n={n} t={t} price={price} />
          ))}
          <motion.circle cx={w.x} cy={w.y} r={flashR} fill="none" stroke="var(--crimson)" strokeWidth={2} style={{ opacity: flashO }} />
          <circle r={58} fill="var(--void)" stroke="var(--cyan)" strokeWidth={2} />
          <circle r={70} fill="none" stroke="var(--cyan)" strokeOpacity={0.25} />
          <text y={2} textAnchor="middle" className="fill-ink font-display" fontSize={30} fontWeight={800}>
            YOU
          </text>
          <text y={26} textAnchor="middle" className="fill-cyan font-mono" fontSize={13} letterSpacing={2}>
            BID_REQUEST
          </text>
        </svg>
      </motion.div>
      <div className="absolute right-3 top-0 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3 sm:right-16 sm:text-[10px]">bidders: illustrative archetypes</div>
      <motion.div style={{ opacity: resO, y: resY }} className="absolute bottom-0 left-1/2 w-[min(92%,460px)] -translate-x-1/2">
        <div className="glass rounded-xl px-4 py-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
            winner · {w.name} · clearing price
          </div>
          <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-crimson text-glow-crimson sm:text-4xl">
            ${price.toFixed(2)} <span className="font-mono text-xs font-normal tracking-[0.2em] text-ink-2">CPM</span>
          </div>
          <div className="mt-1 text-[12px] text-ink-2">
            {BIDDERS.length - 1} losing bidders still received your profile.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────── 04/05 · BROKER + BREACH ────────────────────────── */

const SLABS = 14;
const YOU_SLAB = 8;

function Slab({ i, fill, crack, you }: { i: number; fill: MV; crack: MV; you: string }) {
  const s = (i / SLABS) * 0.82;
  const k = useTransform(() => easeOut(win(fill.get(), s, s + 0.14)));
  const jx = (((i * 37) % 11) - 5) / 5;
  const jr = (((i * 53) % 9) - 4) / 4;
  const y = useTransform(k, [0, 1], [-260, 0]);
  const x = useTransform(crack, [0.5, 1], [0, jx * 26]);
  const rotate = useTransform(crack, [0.5, 1], [0, jr * 3.5]);
  const isYou = i === YOU_SLAB;
  const id = (0x3fa1 + i * 2711).toString(16).toUpperCase();
  return (
    <motion.div
      style={{ y, x, rotate, opacity: k }}
      className={cn(
        "flex h-[clamp(11px,2.5svh,22px)] items-center gap-2 overflow-hidden whitespace-nowrap rounded-[3px] border px-2 font-mono text-[clamp(7px,1.25svh,10.5px)]",
        isYou ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-amber/25 bg-amber/[0.06] text-amber/80",
      )}
    >
      {isYou ? (
        <span className="truncate">YOU · {you}</span>
      ) : (
        <>
          <span>REC {id}</span>
          <span className="h-[0.9em] w-[18%] rounded-[1px] bg-amber/30" />
          <span>SSN ███-██-{String((i * 7919) % 10000).padStart(4, "0")}</span>
          <span className="hidden h-[0.9em] w-[22%] rounded-[1px] bg-amber/25 sm:block" />
          <span className="hidden sm:inline">ADDR ██████</span>
        </>
      )}
    </motion.div>
  );
}

function Tower({ fill, crack, you }: { fill: MV; crack: MV; you: string }) {
  const crackO = useTransform(crack, [0, 0.05], [0, 1]);
  return (
    <div className="ticks relative w-[min(520px,88%)] p-3" data-ghost="your device hash joined to 13 strangers' records · sold as 'audience'">
      <div className="relative flex flex-col-reverse gap-[3px]">
        {Array.from({ length: SLABS }, (_, i) => (
          <Slab key={i} i={i} fill={fill} crack={crack} you={you} />
        ))}
        <motion.svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" style={{ opacity: crackO }}>
          <motion.path
            d="M48 0 L55 12 L44 24 L58 37 L46 50 L60 63 L42 76 L54 88 L47 100"
            fill="none"
            stroke="var(--crimson)"
            strokeWidth={0.9}
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: crack, filter: "drop-shadow(0 0 4px var(--crimson))" }}
          />
        </motion.svg>
      </div>
      <div className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.24em] text-ink-3">broker vault · background-check records</div>
    </div>
  );
}

const TOP = "h-[clamp(76px,16svh,150px)]";

export function SceneBroker({ t, packets }: SceneProps) {
  const zero = useMotionValue(0);
  const fill = useTransform(t, [0.12, 0.88], [0, 1]);
  const rows = useTransform(t, (v) => (2.9 * easeOut(win(v, 0.12, 0.86))).toFixed(1) + "B");
  const headO = useTransform(t, [0.1, 0.2], [0, 1]);
  const you = packets.map((p) => p.value).slice(0, 3).join(" · ");
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end">
      <motion.div style={{ opacity: headO }} className={cn(TOP, "flex flex-col items-center justify-center text-center")}>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-3 sm:text-[11px]">records on file · National Public Data</div>
        <div className="font-display text-[clamp(2.4rem,8svh,5.5rem)] font-extrabold leading-none tabular-nums text-amber">
          <motion.span>{rows}</motion.span> <span className="font-serif text-[0.55em] font-normal italic text-ink-2">rows</span>
        </div>
      </motion.div>
      <Tower fill={fill} crack={zero} you={you} />
    </div>
  );
}

const WORDS = ["SSN", "DOB", "ADDR", "NAME", "███-██", "PHONE", "ZIP", "REC"];

function BreachParticles({ t }: { t: MV }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    type P = { ox: number; oy: number; dx: number; dy: number; s: number; d: number; w: string | null };
    let parts: P[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = true;
    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = prng(2900);
      const n = W < 640 ? 150 : 300;
      const tw = Math.min(W * 0.8, 500);
      parts = Array.from({ length: n }, () => {
        const ox = W / 2 + (r() - 0.5) * tw;
        const oy = H * (0.3 + r() * 0.65);
        const a = Math.atan2(oy - H * 0.62, ox - W / 2) + (r() - 0.5) * 1.4;
        const dist = (0.3 + r() * 0.8) * Math.max(W, H) * 0.7;
        return { ox, oy, dx: Math.cos(a) * dist, dy: Math.sin(a) * dist - r() * H * 0.25, s: 1.5 + r() * 3.5, d: r() * 0.16, w: r() < 0.14 ? WORDS[Math.floor(r() * WORDS.length)] : null };
      });
    };
    const draw = () => {
      raf = 0;
      const v = t.get();
      g.clearRect(0, 0, W, H);
      if (v < 0.28) return;
      g.font = "10px ui-monospace, monospace";
      for (const p of parts) {
        const e = easeOut(win(v, 0.3 + p.d, 0.82 + p.d));
        if (e <= 0) continue;
        const x = p.ox + p.dx * e;
        const y = p.oy + p.dy * e + e * e * H * 0.12;
        const a = Math.min(1, e * 8) * (1 - e * 0.55);
        g.fillStyle = `rgba(255,51,102,${a.toFixed(3)})`;
        if (p.w) g.fillText(p.w, x, y);
        else g.fillRect(x, y, p.s, p.s * 0.6);
      }
    };
    const schedule = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    build();
    schedule();
    const unsub = t.on("change", schedule);
    const ro = new ResizeObserver(() => {
      build();
      schedule();
    });
    ro.observe(cv);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) schedule();
    });
    io.observe(cv);
    return () => {
      unsub();
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [t]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export function SceneBreach({ t, packets }: SceneProps) {
  const full = useMotionValue(1);
  const crack = useTransform(t, [0.06, 0.3], [0, 1]);
  const towerO = useTransform(t, [0.3, 0.42], [1, 0]);
  const towerS = useTransform(t, [0.28, 0.42], [1, 1.06]);
  const flash = useTransform(t, [0.28, 0.31, 0.42], [0, 0.22, 0]);
  const h1O = useTransform(t, [0.42, 0.5], [0, 1]);
  const h1Y = useTransform(t, [0.42, 0.5], [30, 0]);
  const h2O = useTransform(t, [0.52, 0.6], [0, 1]);
  const h3O = useTransform(t, [0.6, 0.7], [0, 1]);
  const you = packets.map((p) => p.value).slice(0, 3).join(" · ");
  return (
    <div className="absolute inset-0">
      <motion.div style={{ opacity: towerO, scale: towerS }} className="absolute inset-0 flex flex-col items-center justify-end">
        <div className={TOP} />
        <Tower fill={full} crack={crack} you={you} />
      </motion.div>
      <BreachParticles t={t} />
      <motion.div style={{ opacity: flash }} className="pointer-events-none absolute -inset-[40%] bg-crimson" />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div style={{ opacity: h1O, y: h1Y }} className="max-w-3xl text-center" data-ghost="read about a breach → identity-theft anxiety → credit-monitoring ads">
          <div className="inline-flex items-center gap-2 rounded bg-crimson/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-crimson">
            breach · National Public Data · 2024
          </div>
          <div className="mt-4 font-display text-[clamp(2.2rem,8vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-glow-crimson">
            2.9B rows <motion.span style={{ opacity: h2O }} className="font-serif font-normal italic text-crimson">for $3.5M.</motion.span>
          </div>
          <motion.p style={{ opacity: h3O }} className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-ink-2 sm:text-sm">
            Then ~2.7B rows were posted for free. 2.9B is a row count, not people: an estimated 272M–899M unique SSNs.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

/* ────────────────────────── 06 · THE SHIELD ────────────────────────── */

function Bounce({ p, i, n, t, w }: { p: Packet; i: number; n: number; t: MV; w: MV }) {
  const a = (i / n) * Math.PI * 2 + 0.5;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const s0 = 0.2 + i * 0.03;
  // far → touching the shield → knocked back out
  const d = useTransform(() => {
    const v = t.get();
    const R0 = w.get() * 0.5;
    if (v < s0 + 0.12) return R0 * (2.1 - 1.05 * easeInOut(win(v, s0, s0 + 0.12)));
    return R0 * (1.05 + 0.9 * easeOut(win(v, s0 + 0.12, s0 + 0.3)));
  });
  const x = useTransform(d, (v) => c * v);
  const y = useTransform(d, (v) => s * v * 0.85);
  const opacity = useTransform(t, [s0, s0 + 0.04, s0 + 0.2, s0 + 0.32], [0, 1, 1, 0]);
  return (
    <At x={x} y={y} style={{ opacity }}>
      <span className="whitespace-nowrap rounded border border-crimson/50 bg-void/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-crimson sm:text-[10px]">{p.key}</span>
    </At>
  );
}

function RedactRow({ p, i, t }: { p: Packet; i: number; t: MV }) {
  const s = 0.36 + i * 0.05;
  const bar = useTransform(t, [s, s + 0.06], [0, 1]);
  const dim = useTransform(t, [s, s + 0.06], [1, 0.35]);
  return (
    <div className={cn("items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-0", i >= 4 ? "hidden sm:flex" : "flex")}>
      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3 sm:text-[10.5px]">{p.label}</span>
      <span className="relative min-w-0 truncate font-mono text-[11px] text-ink sm:text-[12px]">
        <motion.span style={{ opacity: dim }}>{p.value}</motion.span>
        <motion.span aria-hidden style={{ scaleX: bar, originX: 0 }} className="absolute inset-y-[12%] left-0 right-0 rounded-[2px] bg-ink" />
      </span>
    </div>
  );
}

export function SceneShield({ t, packets, price }: SceneProps) {
  const { ref, w } = useBox<HTMLDivElement>();
  const draw = useTransform(t, [0.04, 0.28], [0, 1]);
  const fillO = useTransform(t, [0.22, 0.34], [0, 0.14]);
  const glow = useTransform(t, [0.2, 0.34, 1], [0, 0.9, 0.6]);
  const shS = useTransform(t, [0.04, 0.3], [0.85, 1]);
  const cardO = useTransform(t, [0.28, 0.38], [0, 1]);
  const cardX = useTransform(t, [0.28, 0.38], [24, 0]);
  const oldP = useTransform(t, [0.68, 0.74], [1, 0]);
  const newP = useTransform(t, [0.68, 0.74], [0, 1]);
  const ctaO = useTransform(t, [0.72, 0.84], [0, 1]);
  const ctaY = useTransform(t, [0.72, 0.84], [16, 0]);
  const pe = useTransform(t, (v) => (v > 0.76 ? "auto" : "none"));
  const tick = useTransform(t, [0.5, 0.62], [0, 1]);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 lg:flex-row lg:gap-16">
      <motion.div ref={ref} style={{ scale: shS }} className="relative aspect-[5/6] h-[clamp(120px,26svh,330px)] shrink-0 lg:h-[clamp(200px,48svh,380px)]" data-ghost="signal lost · fingerprint inconsistent · bid withdrawn">
        <motion.div style={{ opacity: glow }} className="absolute inset-[-12%] rounded-full bg-cyan/20 blur-3xl" />
        <svg aria-hidden viewBox="0 0 200 240" className="relative h-full w-full overflow-visible">
          <motion.path d="M100 8 L184 40 V118 C184 172 148 210 100 232 C52 210 16 172 16 118 V40 Z" fill="var(--cyan)" style={{ fillOpacity: fillO }} stroke="none" />
          <motion.path
            d="M100 8 L184 40 V118 C184 172 148 210 100 232 C52 210 16 172 16 118 V40 Z"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={3}
            strokeLinejoin="round"
            style={{ pathLength: draw, filter: "drop-shadow(0 0 8px rgba(0,242,254,.8))" }}
          />
          <motion.path d="M70 122 L92 144 L134 98" fill="none" stroke="var(--lime)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: tick }} />
        </svg>
        {packets.map((p, i) => (
          <Bounce key={p.id} p={p} i={i} n={packets.length} t={t} w={w} />
        ))}
      </motion.div>
      <div className="flex w-[min(100%,420px)] flex-col gap-3">
        <motion.div style={{ opacity: cardO, x: cardX }} className="glass rounded-xl px-4 py-3" data-ghost="dossier going dark · retargeting audience shrinking">
          <div className="mb-1 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.22em] sm:text-[10.5px]">
            <span className="text-cyan">your shadow profile</span>
            <span className="text-ink-3">preview</span>
          </div>
          {packets.map((p, i) => (
            <RedactRow key={p.id} p={p} i={i} t={t} />
          ))}
          <div className="relative mt-2 flex items-baseline justify-between">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-3">your price</span>
            <span className="relative font-display text-xl font-extrabold tabular-nums sm:text-2xl">
              <motion.span style={{ opacity: oldP }} className="text-crimson">${price.toFixed(2)}</motion.span>
              <motion.span style={{ opacity: newP }} className="absolute right-0 top-0 text-lime text-glow-lime">${BASE_CPM.toFixed(2)}</motion.span>
            </span>
          </div>
        </motion.div>
        <motion.div style={{ opacity: ctaO, y: ctaY, pointerEvents: pe }} className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button href="/defense" tone="cyan">Build your shield</Button>
          <Button href="/audit" variant="ghost" tone="cyan">Run the audit</Button>
        </motion.div>
      </div>
    </div>
  );
}
