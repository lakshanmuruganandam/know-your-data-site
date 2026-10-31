"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ChevronDown, Globe, KeyRound, Laptop, Wifi } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Code, Source, Tag, ease, spring, toneBorder, toneText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LAYERS, type Layer, type Panel } from "./data";
import { TwoFactorLadder } from "./TwoFactorLadder";

const ICON_FOR: Record<string, typeof Globe> = { browser: Globe, network: Wifi, os: Laptop, identity: KeyRound };

/* ring radii, inner → outer (L1 closest to "you") */
const RINGS = [
  { r: 74, w: 22 },
  { r: 106, w: 22 },
  { r: 138, w: 22 },
  { r: 170, w: 22 },
];

/* each ring is drawn as FRAGS arc shards that fly in from outside and lock together on first view */
const FRAGS = 8;
const r2 = (v: number) => Math.round(v * 100) / 100;
function shard(r: number, k: number) {
  const gap = 0.012; // radians — hairline seams between shards
  const a0 = (k / FRAGS) * Math.PI * 2 + gap - Math.PI / 2;
  const a1 = ((k + 1) / FRAGS) * Math.PI * 2 - gap - Math.PI / 2;
  const mid = (a0 + a1) / 2;
  return {
    d: `M ${r2(200 + r * Math.cos(a0))} ${r2(200 + r * Math.sin(a0))} A ${r} ${r} 0 0 1 ${r2(200 + r * Math.cos(a1))} ${r2(200 + r * Math.sin(a1))}`,
    dx: r2(Math.cos(mid) * 90),
    dy: r2(Math.sin(mid) * 90),
    rot: k % 2 ? 24 : -24,
  };
}
const SHARDS = RINGS.map((g) => Array.from({ length: FRAGS }, (_, k) => shard(g.r, k)));

export function Layers() {
  const [active, setActive] = useState(0);
  const layer = LAYERS[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <Armour active={active} onSelect={setActive} />
        <div role="tablist" aria-label="Defense layers" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {LAYERS.map((l, i) => {
            const Icon = ICON_FOR[l.id] ?? Globe;
            const on = i === active;
            return (
              <motion.button
                key={l.id}
                role="tab"
                id={`layer-tab-${l.id}`}
                aria-selected={on}
                aria-controls={`layer-panel-${l.id}`}
                onClick={() => setActive(i)}
                whileTap={{ scale: 0.98 }}
                data-ghost={l.ghost}
                className={cn(
                  "relative flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan",
                  on ? cn(toneBorder[l.tone], "bg-white/[0.04]") : "border-line hover:border-line-2",
                )}
              >
                <Icon size={15} className={on ? toneText[l.tone] : "text-ink-3"} />
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">L{l.n}</span>
                  <span className={cn("block truncate text-sm", on ? "text-ink" : "text-ink-2")}>{l.name}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0" role="tabpanel" id={`layer-panel-${layer.id}`} aria-labelledby={`layer-tab-${layer.id}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease }}
          >
            <LayerHead layer={layer} />
            <Accordion layer={layer} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Armour({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const reduce = useReducedMotion();
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(i);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSelect((i + 1) % LAYERS.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSelect((i + LAYERS.length - 1) % LAYERS.length);
    }
  };
  const stopR = RINGS[active].r + RINGS[active].w / 2 + 2;

  return (
    <div className="glass ticks relative mx-auto w-full max-w-[440px] overflow-hidden rounded-3xl p-3" data-ghost="armour scan: 4 layers · each one fails differently">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <svg viewBox="0 0 400 400" className="relative block h-auto w-full" role="group" aria-label="Concentric defense layers — select a ring">
        <defs>
          <radialGradient id="kyd-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </radialGradient>
          {RINGS.map((g, i) => (
            <path key={i} id={`kyd-ring-arc-${i}`} d={`M ${200 - g.r} 200 A ${g.r} ${g.r} 0 0 1 ${200 + g.r} 200`} />
          ))}
        </defs>

        {/* incoming probes stopped at the active ring */}
        {!reduce &&
          Array.from({ length: 10 }).map((_, k) => {
            const a = (k / 10) * Math.PI * 2 + 0.3;
            const cos = Math.round(Math.cos(a) * 1e4) / 1e4;
            const sin = Math.round(Math.sin(a) * 1e4) / 1e4;
            return (
              <motion.circle
                key={`${k}-${active}`}
                r="2.4"
                fill="var(--crimson)"
                initial={{ cx: 200 + cos * 205, cy: 200 + sin * 205, opacity: 0 }}
                animate={{ cx: [200 + cos * 205, 200 + cos * stopR], cy: [200 + sin * 205, 200 + sin * stopR], opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: k * 0.18, ease: "easeIn", times: [0, 1] }}
              />
            );
          })}

        {RINGS.map((g, i) => {
          const l = LAYERS[i];
          const on = i === active;
          const color = `var(--${l.tone})`;
          return (
            <g
              key={l.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`Layer ${l.n}: ${l.name}`}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => onKey(e, i)}
              className="cursor-pointer outline-none [&:focus-visible_.focus-ring]:opacity-100"
              data-ghost={l.ghost}
            >
              {SHARDS[i].map((f, k) => (
                <motion.path
                  key={k}
                  d={f.d}
                  fill="none"
                  stroke={color}
                  strokeOpacity={on ? 0.22 : 0.07}
                  strokeWidth={g.w}
                  initial={{ x: f.dx, y: f.dy, rotate: f.rot, opacity: 0 }}
                  whileInView={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 16, delay: 0.15 + (RINGS.length - 1 - i) * 0.16 + k * 0.035 }}
                />
              ))}
              <circle className="focus-ring opacity-0" cx="200" cy="200" r={g.r + g.w / 2 + 1} fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 4" />
              <motion.circle
                cx="200"
                cy="200"
                r={g.r}
                fill="none"
                stroke={color}
                strokeWidth={on ? 2 : 1}
                strokeOpacity={on ? 1 : 0.35}
                strokeDasharray={on ? "6 6" : "1 7"}
                style={{ filter: on ? `drop-shadow(0 0 6px ${color})` : undefined }}
                animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
                transition={{ duration: on ? 24 : 60, repeat: Infinity, ease: "linear" }}
              />
              <text className="select-none font-mono" fontSize="10" letterSpacing="2.5" fill={on ? color : "var(--ink-3)"} dy="3.5">
                <textPath href={`#kyd-ring-arc-${i}`} startOffset="50%" textAnchor="middle">
                  {`L${l.n} · ${l.name.toUpperCase()}`}
                </textPath>
              </text>
            </g>
          );
        })}

        {/* core */}
        <circle cx="200" cy="200" r="56" fill="url(#kyd-core)" />
        <circle cx="200" cy="200" r="34" fill="var(--carbon)" stroke="var(--cyan)" strokeOpacity="0.5" />
        <text x="200" y="197" textAnchor="middle" className="font-display" fontSize="15" fontWeight="800" fill="var(--ink)">
          YOU
        </text>
        <text x="200" y="212" textAnchor="middle" className="font-mono" fontSize="7" letterSpacing="1.5" fill="var(--ink-3)">
          RAW DATA
        </text>

        {/* outer law ring */}
        <circle cx="200" cy="200" r="194" fill="none" stroke="var(--ink-3)" strokeOpacity="0.4" strokeDasharray="1 5" />
        <text x="200" y="396" textAnchor="middle" className="font-mono" fontSize="8" letterSpacing="2" fill="var(--ink-3)">
          + THE LAW (PDPL) — FOR DATA ALREADY TAKEN
        </text>
      </svg>
    </div>
  );
}

function LayerHead({ layer }: { layer: Layer }) {
  return (
    <div className="mb-6">
      <Tag tone={layer.tone}>Layer {layer.n} — {layer.where}</Tag>
      <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {layer.name}{" "}
        <span className={cn("font-serif font-normal italic tracking-normal", toneText[layer.tone])}>armour</span>
      </h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-lime/20 bg-lime/[0.03] p-3" data-ghost={`blocked at L${layer.n}: ${layer.stops.toLowerCase()}`.slice(0, 90)}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime">Stops</p>
          <p className="mt-1 text-sm text-ink-2">{layer.stops}</p>
        </div>
        <div className="rounded-xl border border-crimson/20 bg-crimson/[0.03] p-3" data-ghost={`leaks past L${layer.n}: ${layer.misses.toLowerCase()}`.slice(0, 90)}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-crimson">Misses</p>
          <p className="mt-1 text-sm text-ink-2">{layer.misses}</p>
        </div>
      </div>
    </div>
  );
}

function Accordion({ layer }: { layer: Layer }) {
  const [open, setOpen] = useState<string | null>(layer.panels[0]?.id ?? null);
  return (
    <div className="space-y-2">
      {layer.panels.map((p, i) => (
        <AccordionItem key={p.id} panel={p} layer={layer} index={i} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} />
      ))}
      <Source>
        {layer.n === 1 && "Dossier §4 (L. Muruganandam); browser steps also from Farha Hareesh §1 and Sumayya §1 (Steps 2–4). Pref names valid for Firefox 128+; re-check per release."}
        {layer.n === 2 && "Dossier §5. ECH = RFC 9849 (TLS Encrypted Client Hello, 2026); RFC 8744 = SNI-encryption requirements. Resolver scores are the dossier's rubric."}
        {layer.n === 3 && "Dossier §6; Windows/macOS/phone toggles also from Sumayya §1 Steps 6–7. AllowTelemetry=0 only applies on Enterprise/Education."}
        {layer.n === 4 && "Dossier §7; account-security habits from Sumayya §3C and Farha Hareesh §3."}
      </Source>
    </div>
  );
}

function AccordionItem({ panel, layer, index, open, onToggle }: { panel: Panel; layer: Layer; index: number; open: boolean; onToggle: () => void }) {
  const id = `acc-${layer.id}-${panel.id}`;
  return (
    <div data-ghost={panel.ghost} className={cn("glass overflow-hidden rounded-2xl border transition-colors", open ? toneBorder[layer.tone] : "border-transparent")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-cyan"
      >
        <span className={cn("font-mono text-[11px] tabular-nums", open ? toneText[layer.tone] : "text-ink-3")}>
          {layer.n}.{index + 1}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-medium text-ink">{panel.title}</span>
        {panel.code && <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3 sm:inline">config</span>}
        {panel.warn && <AlertTriangle size={14} className="shrink-0 text-amber" aria-label="has warning" />}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="shrink-0 text-ink-3">
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-line p-4">
              <p className="text-sm leading-relaxed text-ink-2">{panel.blurb}</p>
              {panel.id === "2fa" && <TwoFactorLadder />}
              {panel.bullets && (
                <ul className="space-y-1.5">
                  {panel.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm leading-relaxed text-ink-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: `var(--${layer.tone})` }} />
                      <span className="min-w-0 break-words">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {panel.warn && (
                <div role="note" className="flex gap-3 rounded-xl border border-amber/30 bg-amber/[0.05] p-3" data-ghost="read the warning → segment: privacy-aware · lower-yield audience">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" />
                  <p className="text-[13px] leading-relaxed text-ink-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-amber">Warning · </span>
                    {panel.warn}
                  </p>
                </div>
              )}
              {panel.code && <Code code={panel.code.code} lang={panel.code.lang} title={panel.code.title} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
