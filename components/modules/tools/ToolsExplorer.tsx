"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Search, Sparkles, X } from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Button, CopyButton, DownloadButton, Source, Tag, ease, spring } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CATEGORIES, HANDBOOK_STACK, TOOLS, toolById, type Category, type Tool } from "@/lib/data/tools";
import { SwapMatrix } from "./SwapMatrix";
import { ToolCardBody, UxMeter } from "./ToolCard";

type Toggle = "open" | "self" | "zk" | "free";
const TOGGLES: { id: Toggle; label: string; test: (t: Tool) => boolean; ghost: string }[] = [
  { id: "open", label: "Open source", test: (t) => t.openSource, ghost: "filter: open source → auditability preference logged" },
  { id: "self", label: "Self-hostable", test: (t) => t.selfHostable, ghost: "filter: self-host → technical user · ad yield low" },
  { id: "zk", label: "Zero-knowledge", test: (t) => t.zeroKnowledge === "yes", ghost: "filter: e2e → content scanning impossible" },
  { id: "free", label: "Free", test: (t) => t.free, ghost: "filter: free → student segment · price-sensitive" },
];

type Stack = Partial<Record<Category, string>>;

export function ToolsExplorer() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [on, setOn] = useState<Record<Toggle, boolean>>({ open: false, self: false, zk: false, free: false });
  const [stack, setStack] = useState<Stack>({});
  const dirRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const t of TOOLS) c[t.category] = (c[t.category] ?? 0) + 1;
    return c;
  }, []);

  const list = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      for (const tg of TOGGLES) if (on[tg.id] && !tg.test(t)) return false;
      if (!needle) return true;
      const hay = [t.name, t.category, t.oneLiner, t.jurisdiction, t.cost, ...t.replaces, ...t.protocols].join(" ").toLowerCase();
      return needle.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [cat, dq, on]);

  const pickFromMatrix = (c: Category) => {
    setCat(c);
    dirRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleStack = (t: Tool) => setStack((s) => ({ ...s, [t.category]: s[t.category] === t.id ? undefined : t.id }));
  const anyFilter = cat !== "All" || q !== "" || Object.values(on).some(Boolean);

  return (
    <>
      {/* ── swap matrix ── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Tag tone="crimson">Big Tech → replacement</Tag>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Cross it out. <span className="font-serif font-normal italic text-lime">Swap</span> it in.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-ink-3">Tap a default to see every alternative for it in the directory below. Hover to pause the cycle.</p>
        </div>
        <SwapMatrix active={cat} onPick={pickFromMatrix} />
      </section>

      {/* ── directory ── */}
      <section ref={dirRef} id="directory" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Tag tone="cyan">Directory</Tag>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {TOOLS.length} tools. <span className="font-serif font-normal italic text-cyan">Zero</span> sponsors.
            </h2>
          </div>
        </div>

        {/* controls */}
        <div className="glass sticky top-20 z-20 space-y-3 rounded-2xl p-3 sm:p-4" data-ghost="search box focused → query intent capture… blocked (no network)">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search tools</span>
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search: gmail, wireguard, swiss, passkeys…"
                className="w-full rounded-xl border border-line bg-void/70 py-2.5 pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-ink-3/70 focus:border-cyan/60"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink">
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filters">
              {TOGGLES.map((tg) => (
                <motion.button
                  key={tg.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={on[tg.id]}
                  onClick={() => setOn((s) => ({ ...s, [tg.id]: !s[tg.id] }))}
                  data-ghost={tg.ghost}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-cyan",
                    on[tg.id] ? "border-lime/60 bg-lime/10 text-lime" : "border-line text-ink-2 hover:border-line-2",
                  )}
                >
                  <span className={cn("relative h-3 w-5 rounded-full transition-colors", on[tg.id] ? "bg-lime/40" : "bg-white/10")}>
                    <motion.span layout transition={spring} className={cn("absolute top-0.5 h-2 w-2 rounded-full", on[tg.id] ? "right-0.5 bg-lime" : "left-0.5 bg-ink-3")} />
                  </span>
                  {tg.label}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label="Category">
            {(["All", ...CATEGORIES] as const).map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={active}
                  data-ghost={`category: ${c.toLowerCase()} → interest vector updated`}
                  className={cn("relative shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-cyan", active ? "text-void" : "text-ink-2 hover:text-ink")}
                >
                  {active && <motion.span layoutId="cat-pill" transition={spring} className="absolute inset-0 -z-10 rounded-full bg-cyan" />}
                  {c}
                  <span className={cn("ml-1.5 tabular-nums", active ? "text-void/60" : "text-ink-3")}>{c === "All" ? TOOLS.length : counts[c]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3" aria-live="polite">
            <motion.span key={list.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block text-lime tabular-nums">
              {list.length}
            </motion.span>{" "}
            / {TOOLS.length} tools match
          </p>
          {anyFilter && (
            <button
              type="button"
              onClick={() => {
                setCat("All");
                setQ("");
                setOn({ open: false, self: false, zk: false, free: false });
              }}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3 hover:text-ink"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        <motion.div layout className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          <AnimatePresence mode="popLayout">
            {list.map((t, i) => (
              <motion.article
                key={t.id}
                layout
                /* cards flip in on their vertical axis like dealt index cards, staggered across the row */
                initial={{ opacity: 0, rotateY: -72, x: -16, scale: 0.96 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-4% 0px" }}
                exit={reduce ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, rotateY: 70, scale: 0.94, transition: { duration: 0.2 } }}
                transition={reduce ? { duration: 0 } : { ...spring, delay: (i % 3) * 0.08, opacity: { duration: 0.3, delay: (i % 3) * 0.08 } }}
                style={{ transformPerspective: 1100, originX: 0 }}
                data-ghost={t.ghost}
                className={cn("glass glass-hover rounded-2xl", stack[t.category] === t.id && "border-lime/40")}
              >
                <ToolCardBody t={t} inStack={stack[t.category] === t.id} onStack={() => toggleStack(t)} />
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {list.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10 text-center font-mono text-[12px] text-ink-3">
              No tool passes every filter. Loosen a toggle — privacy is a trade-off, not a purity test.
            </motion.p>
          )}
        </AnimatePresence>
        <Source>
          UX scores (1–10) and costs follow L. Muruganandam, <em>Know Your Data</em> handbook §9.1 where rated; others are the team&apos;s estimate on the same scale. Prices approximate for late 2026 —
          re-check. No sponsorships, no affiliate links; URLs are plain links, no logos are fetched.
        </Source>
      </section>

      {/* ── stack builder ── */}
      <StackBuilder stack={stack} setStack={setStack} />
    </>
  );
}

function StackBuilder({ stack, setStack }: { stack: Stack; setStack: (s: Stack) => void }) {
  const chosen = CATEGORIES.map((c) => ({ c, t: stack[c] ? toolById(stack[c]!) : undefined })).filter((x): x is { c: Category; t: Tool } => !!x.t);
  const avg = chosen.length ? chosen.reduce((a, x) => a + x.t.ux, 0) / chosen.length : 0;
  const oss = chosen.filter((x) => x.t.openSource).length;
  const zk = chosen.filter((x) => x.t.zeroKnowledge === "yes").length;
  const summary = chosen.length
    ? [
        "MY PRIVACY STACK — built with Know Your Data",
        "",
        ...chosen.map((x) => `${x.c.padEnd(10)} ${x.t.name}  (replaces ${x.t.replaces[0]})  — ${x.t.url}`),
        "",
        `${chosen.length} swaps · ${oss}/${chosen.length} open source · ${zk} zero-knowledge · avg ease ${avg.toFixed(1)}/10`,
      ].join("\n")
    : "";

  return (
    <section id="stack" className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Tag tone="lime">Build my stack</Tag>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            One pick per <span className="font-serif font-normal italic text-lime">slot.</span>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-3">Choose here or with the + on any card. Start from the handbook&apos;s recommended student stack if you&apos;re unsure.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" tone="lime" onClick={() => setStack({ ...HANDBOOK_STACK })}>
            <Sparkles size={14} /> Handbook default
          </Button>
          <Button variant="ghost" tone="ink" onClick={() => setStack({})} disabled={!chosen.length}>
            <RotateCcw size={14} /> Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-carbon/50">
          {CATEGORIES.map((c) => {
            const opts = TOOLS.filter((t) => t.category === c);
            return (
              <div key={c} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4" role="radiogroup" aria-label={`${c} pick`}>
                <span className="w-24 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">{c}</span>
                <div className="flex flex-wrap gap-1.5">
                  {opts.map((t) => {
                    const sel = stack[c] === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setStack({ ...stack, [c]: sel ? undefined : t.id })}
                        data-ghost={`stack slot ${c.toLowerCase()} = ${t.name.toLowerCase()} → data feed severed`}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-cyan",
                          sel ? "border-lime bg-lime/15 text-lime" : "border-line text-ink-2 hover:border-line-2 hover:text-ink",
                        )}
                      >
                        {t.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass ticks relative overflow-hidden rounded-2xl p-5 sm:p-6" data-ghost="stack summary compiled → subject's resale value approaching $0.00">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/10 blur-3xl" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-3">Your stack</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Swaps" value={String(chosen.length)} />
              <Stat label="Open src" value={`${oss}/${chosen.length}`} />
              <Stat label="Zero-know." value={String(zk)} />
            </div>
            {chosen.length > 0 && (
              <div className="mt-4">
                <UxMeter value={Math.round(avg)} />
                <p className="mt-1 font-mono text-[10px] text-ink-3">average ease of use</p>
              </div>
            )}
            <ul className="mt-5 min-h-[120px] space-y-1.5">
              <AnimatePresence initial={false}>
                {chosen.map((x) => (
                  <motion.li
                    key={x.c}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.3, ease }}
                    className="flex items-baseline justify-between gap-3 border-b border-line/60 pb-1.5 text-[13.5px]"
                  >
                    <span className="truncate text-crimson/70 line-through decoration-crimson/60">{x.t.replaces[0]}</span>
                    <span className="shrink-0 font-medium text-lime">{x.t.name}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {!chosen.length && <li className="pt-6 text-center font-mono text-[11.5px] text-ink-3">Nothing picked yet.</li>}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {chosen.length ? (
                <>
                  <CopyButton text={summary} label="Copy stack" />
                  <DownloadButton text={summary} filename="my-privacy-stack.txt" />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-void/50 px-3 py-2">
      <p className="font-display text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">{label}</p>
    </div>
  );
}
