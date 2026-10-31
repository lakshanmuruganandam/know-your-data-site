"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Cookie, Globe, HardDrive, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Card, Counter, Redacted, Reveal, Section, Source, Tag, Tilt, toneText, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";

/* ── breach ticker ── */
const HEADLINES = [
  ["FTC", "Avast fined $16.5M, banned from selling browsing data"],
  ["DPC", "Meta fined €1.2B over EU–US data transfers"],
  ["BREACH", "National Public Data: 2.9B rows of SSNs & addresses exposed"],
  ["COURT", "Google agrees to destroy billions of Incognito records"],
  ["CNIL", "Clearview AI fined €20M for scraping faces"],
  ["FTC", "Facebook: $5B penalty, largest privacy fine in FTC history"],
  ["STUDY", "98% of users agreed to give up their first-born child in a ToS"],
  ["BREACH", "Equifax: 147M people's records exposed"],
] as const;

export function Ticker() {
  const row = [...HEADLINES, ...HEADLINES];
  return (
    <div className="relative overflow-hidden border-y border-line bg-carbon/60 py-3" data-ghost="scanned breach headlines → fear-based ad slot unlocked">
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {row.map(([k, v], i) => (
          <span key={i} className="flex items-center gap-3 font-mono text-[12px] text-ink-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] tracking-[0.2em]", k === "BREACH" ? "bg-crimson/15 text-crimson" : k === "STUDY" ? "bg-amber/15 text-amber" : "bg-cyan/10 text-cyan")}>{k}</span>
            {v}
            <span className="text-ink-3">{"///"}</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}

/* ── the numbers ── */
const STATS: { to: number; dec?: number; pre?: string; suf: string; label: string; tone: Tone; ghost: string }[] = [
  { to: 87, suf: "M", label: "Facebook users harvested by one personality quiz (Cambridge Analytica)", tone: "crimson", ghost: "lingered on CA stat → politics-interest segment" },
  { to: 2.9, dec: 1, suf: "B", label: "rows of names, SSNs & addresses leaked by data broker National Public Data", tone: "amber", ghost: "identity-theft anxiety → credit-monitoring ads" },
  { to: 9.68, dec: 2, pre: "$", suf: "B", label: "Meta's privacy fines 2019–25 — about 4.8% of one year's revenue", tone: "cyan", ghost: "finance-literate reader → fintech lookalike audience" },
  { to: 91, suf: "%", label: "of people accept terms of service without reading them (Deloitte)", tone: "lime", ghost: "you also didn't read ours. we don't have any." },
];

export function Numbers() {
  return (
    <Section className="py-24">
      <Reveal>
        <Tag tone="ink">{"// the scale of it"}</Tag>
      </Reveal>
      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} i={i} className="bg-void">
            <div className="group h-full p-7 transition-colors hover:bg-carbon" data-ghost={s.ghost}>
              <div className={cn("font-display text-5xl font-extrabold tracking-tight xl:text-[3.4rem]", toneText[s.tone])}>
                <Counter to={s.to} decimals={s.dec ?? 0} prefix={s.pre} suffix={s.suf} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Source>FTC (2019, 2024) · Irish DPC (2023) · NPD bankruptcy filings (2024) · Deloitte survey via cohort case studies · Meta 10-K</Source>
    </Section>
  );
}

/* ── two layers explainer ── */
export function TwoLayers() {
  return (
    <Section className="py-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal>
            <Tag tone="crimson">{"// how this site works"}</Tag>
          </Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
            <Redacted>Every page has</Redacted> <Redacted delay={0.1} className="font-serif font-normal italic text-crimson">two layers.</Redacted>
          </h2>
          <Reveal i={2}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">
              The one you read, and the one that reads you. Session-replay scripts record your cursor path, scroll depth and
              hesitation; ad-tech turns them into segments and sells them in auctions that finish before the page loads.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-ink-3">
              Here, the second layer is <span className="text-ink">made visible</span>. <span className="pointer-coarse:hidden">Your cursor is a lens onto it.</span><span className="hidden pointer-coarse:inline">The eye in the bar opens a lens onto it.</span> The dossier on the right
              edge fills itself from your real browser. Then you learn to redact it — for real.
            </p>
          </Reveal>
        </div>

        <Reveal i={1}>
          <LayerWipe />
        </Reveal>
      </div>
    </Section>
  );
}

function LayerWipe() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 35%"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26 });
  const edge = useTransform(p, [0, 1], [96, 8]);
  const clip = useTransform(edge, (e) => `inset(0 0 0 ${e}%)`);
  const left = useTransform(edge, (e) => `${e}%`);
  return (
    <div ref={ref} className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-line" data-ghost="scrubbed the ghost layer → you get it. good.">
      {/* surface */}
      <div className="absolute inset-0 bg-carbon p-6 sm:p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">surface · what you see</div>
        <div className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">Summer Sale</div>
        <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
        <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="aspect-square rounded-lg bg-white/[0.05]" />)}
        </div>
        <div className="mt-6 inline-block rounded-full bg-cyan px-4 py-1.5 font-mono text-[10px] text-void">BUY NOW</div>
      </div>
      {/* ghost layer */}
      <motion.div className="scanlines absolute inset-0 bg-[#140609] p-6 sm:p-8" style={{ clipPath: clip }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-crimson">ghost layer · what they log</div>
        <pre className="mt-6 whitespace-pre-wrap font-mono text-[10.5px] leading-[1.7] text-crimson/90 sm:text-[11.5px]">
{`mousemove  412,288   v=38px/s
dwell      h1 "Summer Sale"  4.2s
hover      img[2]  1.9s → interest: sneakers
hesitate   button.buy  1.1s
scroll     62% → 41%  (re-read price)
segment    "price-sensitive"
segment    "impulse · late-night"
bid        $2.14 → winner: dsp_7
sold to    6 partners · retained 13 mo`}
        </pre>
        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-12 gap-1 opacity-70">
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.div key={i} className="h-2 bg-crimson/60" animate={{ opacity: [0.15, 1, 0.15] }} transition={{ duration: 1.6, repeat: Infinity, delay: (i % 12) * 0.08 + Math.floor(i / 12) * 0.2 }} />
          ))}
        </div>
      </motion.div>
      {/* the seam */}
      <motion.div className="absolute inset-y-0 w-px bg-crimson shadow-[0_0_24px_4px_rgba(255,51,102,.6)]" style={{ left }}>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-crimson/60 bg-void font-mono text-[10px] text-crimson">⟷</span>
      </motion.div>
    </div>
  );
}

/* ── module portals ── */
const MODULES = [
  { href: "/audit", n: "01", title: "Live Audit", accent: "of your browser", tone: "cyan" as Tone, body: "WebRTC IP leaks, canvas fingerprints, GPC signals, timezone exposure — tested live, in your tab.", span: "lg:col-span-7", art: "radar" },
  { href: "/vault", n: "02", title: "Exploit Vault", accent: "declassified", tone: "crimson" as Tone, body: "Avast, Meta, Google Incognito, Clearview, NPD. The deception, the exploit chain, the payout, the fine.", span: "lg:col-span-5", art: "files" },
  { href: "/economics", n: "03", title: "Economics", accent: "of exploitation", tone: "amber" as Tone, body: "Why breaking privacy law is rational: an expected-cost simulator and Meta's fines vs. its revenue.", span: "lg:col-span-5", art: "bars" },
  { href: "/defense", n: "04", title: "Defense Hub", accent: "in 90 minutes", tone: "lime" as Tone, body: "Seven steps, four layers, copy-paste configs. Watch your shadow profile get redacted as you go.", span: "lg:col-span-7", art: "rings" },
  { href: "/legal", n: "05", title: "PDPL Generator", accent: "exercise your rights", tone: "cyan" as Tone, body: "Turn UAE Decree-Law 45/2021 and GDPR into a formal access, objection or erasure request in seconds.", span: "lg:col-span-6", art: "doc" },
  { href: "/tools", n: "06", title: "Tools Directory", accent: "replace big tech", tone: "lime" as Tone, body: "A searchable matrix of open, zero-knowledge alternatives for search, mail, passwords, cloud and DNS.", span: "lg:col-span-6", art: "grid" },
];

export function Portals() {
  return (
    <Section className="py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          <Redacted>Six modules.</Redacted>
          <br />
          <Redacted delay={0.1} className="font-serif font-normal italic text-cyan">One way out.</Redacted>
        </h2>
        <p className="max-w-sm text-ink-2">See it, understand why it happens, then shut it down — in that order.</p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        {MODULES.map((m, i) => (
          <Reveal key={m.href} i={i} className={m.span}>
            <Link href={m.href} className="block h-full" data-ghost={`clicked module ${m.n} → intent: ${m.title.toLowerCase()}`}>
              <Tilt className="h-full">
                <Card className="group flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl p-7">
                  <div className="flex items-start justify-between">
                    <span className={cn("font-mono text-[11px] tracking-[0.2em]", toneText[m.tone])}>{m.n}</span>
                    <div className="flex items-start gap-4">
                      <div className="pointer-events-none opacity-60 transition-opacity group-hover:opacity-100">
                        <Art kind={m.art} tone={m.tone} />
                      </div>
                      <ArrowUpRight size={20} className="text-ink-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </div>
                  </div>
                  <div className="relative">
                    <h3 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                      {m.title} <span className={cn("font-serif text-2xl font-normal italic sm:text-3xl", toneText[m.tone])}>{m.accent}</span>
                    </h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">{m.body}</p>
                  </div>
                </Card>
              </Tilt>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Art({ kind, tone }: { kind: string; tone: Tone }) {
  const c = `var(--${tone === "ink" ? "ink-2" : tone})`;
  const common = { width: 96, height: 96, viewBox: "0 0 120 120", fill: "none", stroke: c, strokeWidth: 1 };
  if (kind === "radar")
    return (
      <svg {...common}>
        {[18, 34, 50].map((r) => <circle key={r} cx="60" cy="60" r={r} strokeOpacity=".35" />)}
        <motion.path d="M60 60 L60 10" strokeWidth="1.5" animate={{ rotate: 360 }} style={{ originX: "60px", originY: "60px" }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
        <circle cx="82" cy="40" r="3" fill={c} />
        <circle cx="38" cy="78" r="2" fill="var(--crimson)" stroke="none" />
      </svg>
    );
  if (kind === "files")
    return (
      <svg {...common}>
        {[0, 1, 2].map((i) => <rect key={i} x={22 + i * 10} y={26 + i * 12} width="62" height="44" rx="3" fill="var(--void)" strokeOpacity={0.4 + i * 0.3} />)}
        <rect x="50" y="64" width="34" height="5" fill={c} stroke="none" />
        <text x="54" y="58" fontSize="7" fill={c} stroke="none" fontFamily="monospace">CLASSIFIED</text>
      </svg>
    );
  if (kind === "bars")
    return (
      <svg {...common}>
        <rect x="16" y="20" width="88" height="14" fill={c} fillOpacity=".15" />
        <motion.rect x="16" y="20" height="14" fill="var(--crimson)" stroke="none" initial={{ width: 0 }} whileInView={{ width: 4 }} transition={{ delay: 0.4 }} />
        <rect x="16" y="50" width="88" height="14" fill={c} fillOpacity=".15" />
        <motion.rect x="16" y="50" height="14" fill="var(--crimson)" stroke="none" initial={{ width: 0 }} whileInView={{ width: 2 }} transition={{ delay: 0.6 }} />
        <text x="16" y="88" fontSize="8" fill={c} stroke="none" fontFamily="monospace">FINE / REVENUE</text>
      </svg>
    );
  if (kind === "rings")
    return (
      <svg {...common}>
        {[14, 26, 38, 50].map((r, i) => (
          <motion.circle key={r} cx="60" cy="60" r={r} strokeDasharray="4 6" animate={{ rotate: i % 2 ? -360 : 360 }} style={{ originX: "60px", originY: "60px" }} transition={{ repeat: Infinity, duration: 10 + i * 4, ease: "linear" }} />
        ))}
        <circle cx="60" cy="60" r="4" fill={c} />
      </svg>
    );
  if (kind === "doc")
    return (
      <svg {...common}>
        <rect x="30" y="16" width="60" height="84" rx="3" fill="var(--void)" />
        {[30, 40, 50, 60, 70].map((y, i) => <line key={y} x1="40" x2={i === 2 ? 64 : 80} y1={y} y2={y} strokeOpacity=".5" />)}
        <text x="40" y="88" fontSize="7" fill={c} stroke="none" fontFamily="monospace">ART. 15</text>
      </svg>
    );
  return (
    <svg {...common}>
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={20 + (i % 4) * 21} y={20 + Math.floor(i / 4) * 21} width="15" height="15" rx="2" strokeOpacity={i % 3 ? 0.35 : 1} />
      ))}
    </svg>
  );
}

/* ── proof that we don't track ── */
export function Proof() {
  const [p, setP] = useState<{ cookies: number; third: number; total: number; storage: number } | null>(null);
  useEffect(() => {
    const read = () => {
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const third = res.filter((r) => {
        try {
          return new URL(r.name).origin !== location.origin;
        } catch {
          return false;
        }
      }).length;
      let storage = 0;
      try {
        storage = localStorage.length;
      } catch {}
      setP({ cookies: document.cookie ? document.cookie.split(";").length : 0, third, total: res.length, storage });
    };
    read();
    const id = setInterval(read, 3000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { icon: Cookie, k: "cookies set", v: p?.cookies ?? "—", good: (p?.cookies ?? 0) === 0 },
    { icon: Globe, k: "third-party requests", v: p ? `${p.third} / ${p.total}` : "—", good: (p?.third ?? 0) === 0 },
    { icon: Radio, k: "analytics beacons", v: 0, good: true },
    { icon: HardDrive, k: "localStorage keys (yours)", v: p?.storage ?? "—", good: true },
  ];

  return (
    <Section className="py-24">
      <Card hover={false} className="ticks overflow-hidden p-8 md:p-12" ghost="checked our receipts → trust +40%. we still logged nothing.">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <Tag tone="lime">{"// living what we preach"}</Tag>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
              Don&apos;t trust us. <span className="font-serif font-normal italic text-lime">Measure us.</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-2">
              These numbers are read live from your own browser&apos;s Performance API, right now. Fonts are self-hosted, there is no analytics
              script, and a strict Content-Security-Policy forbids this page from talking to any other server.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {items.map(({ icon: Icon, k, v, good }) => (
              <div key={k} className="bg-void p-5">
                <Icon size={16} className={good ? "text-lime" : "text-crimson"} />
                <div className={cn("mt-4 whitespace-nowrap font-display text-3xl font-extrabold tabular-nums sm:text-4xl", good ? "text-lime text-glow-lime" : "text-crimson")}>{v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{k}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ── closing: the line assembles as you scroll into it ── */
export function Closing() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const spacing = useTransform(p, [0, 1], ["0.35em", "-0.035em"]);
  const blur = useTransform(p, [0, 0.8], ["blur(14px)", "blur(0px)"]);
  const opacity = useTransform(p, [0, 0.6], [0, 1]);
  const scale = useTransform(p, [0, 1], [1.25, 1]);
  const beam = useTransform(p, [0.4, 1], ["0%", "100%"]);
  return (
    <Section className="relative overflow-hidden py-40 text-center">
      <div ref={ref} className="relative">
        <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-[100px]" style={{ opacity }} />
        <motion.h2
          style={{ letterSpacing: spacing, filter: blur, opacity, scale }}
          className="mx-auto max-w-5xl font-display text-[clamp(2.4rem,6vw,5.4rem)] font-extrabold leading-[0.92]"
        >
          Privacy isn&apos;t hiding.
          <br />
          <span className="font-serif font-normal italic tracking-normal text-cyan text-glow-cyan">It&apos;s choosing who knows.</span>
        </motion.h2>
        <motion.div aria-hidden className="mx-auto mt-10 h-px max-w-xl bg-gradient-to-r from-transparent via-cyan to-transparent" style={{ width: beam }} />
      </div>
      <Reveal i={2}>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/defense" className="rounded-full bg-lime px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-void transition hover:brightness-110">
            Start the 90-minute toolkit
          </Link>
          <Link href="/vault" className="rounded-full border border-line-2 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-2 transition hover:text-ink">
            Open the vault
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
