"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card, Counter, Reveal, Source, Tag } from "@/components/ui";
import { META_AD_REVENUE_2025, META_REVENUE_2025, pct } from "./data";

/* ───────── the value side ───────── */

export function DataValue() {
  const adShare = pct(META_AD_REVENUE_2025, META_REVENUE_2025);
  const items = [
    {
      big: (
        <>
          $<Counter to={287} />–<Counter to={434} />B
        </>
      ),
      label: "global data-broker market, 2025 estimates",
      detail: "Market-research ranges; marketing and ad agencies are the largest buyers of brokered data.",
      src: "[2–5]",
      ghost: "market sizing viewed → you are the inventory in this number",
      tone: "text-crimson",
    },
    {
      big: <Counter to={adShare} decimals={1} suffix="%" />,
      label: "of Meta’s 2025 revenue came from ads",
      detail: "$196.2B of ≈$201.0B. Impressions +12%, average price per ad +9%, credited to better targeting and measurement.",
      src: "[1]",
      ghost: "ads = 98% of revenue · targeting quality = pricing power",
      tone: "text-amber",
    },
    {
      big: <Counter to={57.03} decimals={2} prefix="$" />,
      label: "average revenue per Meta user, 2025 (+15%)",
      detail: "A worldwide average of revenue, not a market price for your data — and revenue is not profit.",
      src: "[15]",
      ghost: "arpu $57.03 · your share of that: $0.00",
      tone: "text-cyan",
    },
    {
      big: (
        <>
          <Counter to={2.68} decimals={2} suffix="×" /> <span className="text-ink-3">vs</span> +4%
        </>
      ),
      label: "targeting premium: what advertisers pay vs what publishers get",
      detail: "2009: advertisers paid 2.68× for behaviourally targeted ads. 2019: a cookie raised publisher revenue only ~4% ($0.00008/ad) — the value may be captured by intermediaries.",
      src: "[16–18]",
      ghost: "the premium exists · it just isn't paid to the site you were reading",
      tone: "text-lime",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <Reveal key={i} i={i}>
          <Card className="flex h-full flex-col p-5" ghost={it.ghost}>
            <p className={`font-display text-[clamp(1.7rem,3.2vw,2.3rem)] font-extrabold leading-none tabular-nums ${it.tone}`}>{it.big}</p>
            <p className="mt-3 font-mono text-[10.5px] uppercase leading-snug tracking-[0.16em] text-ink-2">{it.label}</p>
            <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-3">{it.detail}</p>
            <p className="mt-4 font-mono text-[10px] text-ink-3">SRC ▸ paper {it.src}</p>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}

/* ───────── FTC 2019: the fine that was priced in ───────── */

const TIMELINE = [
  { when: "2018", what: "Facebook books roughly $22B profit for the year.", tone: "var(--ink-2)", ghost: "baseline: $22B/yr" },
  { when: "Apr 2019", what: "Tells investors to expect a $3–5B fine; books a one-time $3B charge in advance.", tone: "var(--amber)", ghost: "penalty provisioned like a utility bill" },
  { when: "Leak", what: "Settlement news leaks. Share price climbs to its highest in nearly a year.", tone: "var(--lime)", ghost: "market reads the fine as good news" },
  { when: "24 Jul 2019", what: "FTC announces $5B (≈9% of 2018 revenue), approved 3–2. Stock dips ~1% on the day.", tone: "var(--crimson)", ghost: "record fine · no substantive limits on collection" },
  { when: "Dissent", what: "Commissioner Slaughter: the stock rise may suggest the market believes a penalty at this level makes a violation profitable.", tone: "var(--cyan)", ghost: "regulator on record: the fine may pay for itself" },
];

export function PricedIn() {
  return (
    <div>
      <ol className="relative border-l border-line-2 pl-6 sm:pl-8">
        {TIMELINE.map((t, i) => (
          <li key={t.when} className="relative pb-7 last:pb-0" data-ghost={t.ghost}>
            <Reveal i={i}>
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 bg-void sm:-left-[39px]" style={{ borderColor: t.tone, boxShadow: `0 0 12px ${t.tone}` }} />
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: t.tone }}>
                {t.when}
              </p>
              <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-2">{t.what}</p>
            </Reveal>
          </li>
        ))}
      </ol>
      <Source>§4.3 of the paper, citing CNBC, MLex, HuffPost/Open Markets, MIT Technology Review, Reuters and TechCrunch (2019) [19–24].</Source>
    </div>
  );
}

/* ───────── repeat offending ───────── */

const CNIL = [
  { year: "2020", eur: 100 },
  { year: "2021", eur: 150 },
  { year: "2025", eur: 325 },
];

export function RepeatOffender() {
  const max = 325;
  const reduce = useReducedMotion();
  return (
    <div data-ghost="same violation, three fines, still compliant enough to keep operating">
      <Tag tone="amber">Google × CNIL · cookie consent</Tag>
      <div className="mt-6 flex h-48 items-end gap-4 sm:gap-6">
        {CNIL.map((c, i) => (
          <div key={c.year} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="font-mono text-[13px] text-amber tabular-nums">€{c.eur}M</span>
            <motion.div
              className="w-full max-w-[84px] rounded-t-md bg-gradient-to-t from-amber/20 to-amber/80"
              initial={{ height: 0 }}
              whileInView={{ height: `${(c.eur / max) * 100}%` }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 9, delay: i * 0.18 }}
            />
            <span className="font-mono text-[11px] text-ink-3">{c.year}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[14px] leading-relaxed text-ink-2">
        Three fines for the same category of violation. Meanwhile Meta’s €1.2B GDPR record was suspended pending appeal, Amazon’s €746M was
        annulled on procedure in 2026 — and Meta still grew revenue 22% in 2025.
      </p>
      <Source>§4.5 of the paper, via SecurityWall GDPR Fines Tracker 2026 [14] and Meta 10-K [1].</Source>
    </div>
  );
}

/* ───────── the balance is shifting ───────── */

const SHIFT = [
  { k: "€7.1B+", v: "cumulative GDPR fines by Jan 2026", src: "[27]" },
  { k: "$3.425B", v: "US state privacy fines in 2025 alone (Gartner est.)", src: "[30]" },
  { k: "$2.775B", v: "Texas vs Meta ($1.4B) + Google ($1.375B)", src: "[28, 29]" },
  { k: "5%", v: "of average daily revenue, per day: DMA periodic penalties that target the business model, not one breach", src: "[9, 31]" },
  { k: "7%", v: "EU AI Act ceiling of global turnover (or €35M)", src: "[14]" },
  { k: "€40M", v: "Criteo fine upheld by France’s Conseil d’État, Mar 2026", src: "[14]" },
];

export function BalanceShifting() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {SHIFT.map((s, i) => (
        <Reveal key={s.k} i={i} className="bg-carbon">
          <div className="h-full p-5" data-ghost="counter-signal logged · regulators adapting · re-price risk model">
            <p className="font-display text-2xl font-extrabold text-lime">{s.k}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{s.v}</p>
            <p className="mt-2 font-mono text-[10px] text-ink-3">SRC ▸ paper {s.src}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
