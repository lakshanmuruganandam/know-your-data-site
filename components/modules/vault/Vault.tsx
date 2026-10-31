"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { Counter, Reveal, Section, Source, spring, toneBg } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CATEGORY_META, cases, totals, type Category, type VaultCase } from "@/lib/data/cases";
import { CaseFolder } from "./CaseFolder";
import { Dossier } from "./Dossier";

type Filter = "all" | Category;
type Sort = "severity" | "year";

const CATS = Object.keys(CATEGORY_META) as Category[];
const startYear = (c: VaultCase) => parseInt(c.years.slice(0, 4), 10);

function StatStrip() {
  const stats = [
    { label: "Case files", node: <Counter to={totals.files} />, tone: "text-ink", ghost: "counted case files · completionist · long session value" },
    { label: "Records harvested, sold or leaked", node: <Counter to={totals.records / 1e9} decimals={1} suffix="B" />, tone: "text-crimson", ghost: "absorbed '37B records' → privacy-anxiety cohort · VPN ads" },
    { label: "Fines & settlements announced", node: <Counter to={totals.finesUsd / 1e9} decimals={2} prefix="$" suffix="B" />, tone: "text-amber", ghost: "read total fines → legal-curious · law-firm retargeting" },
    { label: "Penalties appealed, overturned or pending", node: <Counter to={totals.contested} />, tone: "text-cyan", ghost: "noticed appeals · cynic segment · low ad responsiveness" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} i={i} className={cn("relative border-line p-4 sm:p-6", i % 2 === 1 && "border-l", i >= 2 && "border-t lg:border-t-0", i === 2 && "lg:border-l")}>
            <div data-ghost={s.ghost}>
              <p className={cn("font-display text-[clamp(1.8rem,5vw,3rem)] font-extrabold leading-none tracking-[-0.02em]", s.tone)}>{s.node}</p>
              <p className="mt-3 font-mono text-[10px] uppercase leading-snug tracking-[0.18em] text-ink-3 sm:text-[11px]">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Source>
        Totals computed from the files below. “Records” mixes units — rows, users, profiles and scraped images — and is not a count of unique people
        (e.g. NPD&apos;s 2.9B rows ≈ 272M–899M unique SSNs). Fines converted to USD at approximate rates; the overturned UK ICO Clearview fine and
        unquantified settlements are excluded.
      </Source>
    </div>
  );
}

export function Vault() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("severity");
  const [openId, setOpenId] = useState<string | null>(null);
  const folderRefs = useRef(new Map<string, HTMLButtonElement>());

  const list = useMemo(() => {
    const l = cases.filter((c) => filter === "all" || c.categories.includes(filter));
    return [...l].sort((a, b) => (sort === "severity" ? b.severity - a.severity || a.file.localeCompare(b.file) : startYear(a) - startYear(b)));
  }, [filter, sort]);

  const counts = useMemo(() => Object.fromEntries(CATS.map((k) => [k, cases.filter((c) => c.categories.includes(k)).length])) as Record<Category, number>, []);

  const openIndex = list.findIndex((c) => c.id === openId);
  const open = openIndex >= 0 ? list[openIndex] : null;

  const close = useCallback(() => {
    const id = openId;
    setOpenId(null);
    if (id) requestAnimationFrame(() => folderRefs.current.get(id)?.focus({ preventScroll: true }));
  }, [openId]);
  const step = useCallback(
    (d: number) => {
      if (openIndex < 0 || !list.length) return;
      setOpenId(list[(openIndex + d + list.length) % list.length].id);
    },
    [openIndex, list],
  );

  return (
    <>
      <Section className="pt-0">
        <StatStrip />
      </Section>

      <Section className="pt-4" id="files">
        {/* ── controls ── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">Filter by exploit type</p>
            <LayoutGroup id="vault-filter">
              <div role="radiogroup" aria-label="Filter case files by category" className="mt-3 flex flex-wrap gap-2">
                {(["all", ...CATS] as Filter[]).map((f) => {
                  const active = filter === f;
                  const meta = f === "all" ? null : CATEGORY_META[f];
                  return (
                    <motion.button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFilter(f)}
                      whileTap={{ scale: 0.95 }}
                      data-ghost={meta?.ghost ?? "filter=all → browsing broadly · undecided · high dwell expected"}
                      className={cn(
                        "relative rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan",
                        active ? "border-transparent text-void" : "border-line text-ink-2 hover:border-line-2 hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span layoutId="vault-chip" transition={spring} className={cn("absolute inset-0 rounded-full", meta ? toneBg[meta.tone] : "bg-ink")} />
                      )}
                      <span className="relative flex items-center gap-2">
                        {meta ? meta.label : "All files"}
                        <span className={cn("tabular-nums", active ? "text-void/70" : "text-ink-3")}>{f === "all" ? cases.length : counts[f]}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">Sort</span>
            <div role="radiogroup" aria-label="Sort case files" className="flex rounded-full border border-line p-1">
              {(["severity", "year"] as Sort[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={sort === s}
                  onClick={() => setSort(s)}
                  data-ghost={s === "severity" ? "sorted by severity · threat-focused personality" : "sorted chronologically · researcher profile"}
                  className="relative rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  {sort === s && <motion.span layoutId="vault-sort" transition={spring} className="absolute inset-0 rounded-full bg-white/10" />}
                  <span className={cn("relative", sort === s ? "text-ink" : "text-ink-3")}>{s === "severity" ? "Severity" : "Chronology"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-ink-3" aria-live="polite">
          {list.length} {list.length === 1 ? "file" : "files"} unsealed{filter !== "all" && ` · ${CATEGORY_META[filter].label}`}
        </p>

        {/* ── the drawer of files ── */}
        <motion.ul layout className="mt-4 grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((c, i) => (
              <CaseFolder
                key={c.id}
                c={c}
                index={i}
                onOpen={() => setOpenId(c.id)}
                buttonRef={(el) => {
                  if (el) folderRefs.current.set(c.id, el);
                  else folderRefs.current.delete(c.id);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </Section>

      <AnimatePresence>
        {open && (
          <Dossier
            key="dossier"
            c={open}
            position={`${openIndex + 1} / ${list.length}`}
            onClose={close}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
