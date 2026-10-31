import type { Metadata } from "next";
import { PageHeader, Reveal, Section, Source, Tag } from "@/components/ui";
import { AuditConsole } from "@/components/modules/audit/AuditConsole";

export const metadata: Metadata = { title: "Live Audit — Know Your Data" };

const LIMITS = [
  {
    tone: "lime" as const,
    k: "What runs",
    v: "Seven probes, entirely inside this tab: a STUN-less WebRTC offer, two canvas renders, a few navigator / Intl reads and one same-origin HEAD request to read this site's own HSTS header.",
    ghost: "read the methodology → trust signal ↑ · conversion likelihood ↓",
  },
  {
    tone: "crimson" as const,
    k: "What never happens",
    v: "No third-party servers, no cookies, no analytics. The only thing stored is your last canvas hash in localStorage (kyd.canvas.prev) so the next visit can compare — clear site data to erase it.",
    ghost: "no beacon fired on this page → visitor unmonetisable here · bid: n/a",
  },
  {
    tone: "amber" as const,
    k: "What we can't see",
    v: "Your public IP via STUN, DNS leaks, real third-party cookie behaviour or ad-blocker coverage all need a server we don't run. For those, use EFF's Cover Your Tracks and BrowserLeaks.",
    ghost: "outbound click to eff.org → segment: privacy-activist · suppress retargeting",
  },
];

export default function AuditPage() {
  return (
    <div>
      <PageHeader
        index="// 01"
        kicker="Live browser audit"
        title="Scan your browser like a tracker"
        accent="would."
        tone="cyan"
        lede="This page attacks your browser — gently, locally, and without contacting a single third party. Seven probes check what any website can silently read about you, score your exposure, and hand you the one-click fix for every leak."
      />

      <Section className="pt-0" id="scan">
        <AuditConsole />
      </Section>

      <Section className="pt-4">
        <div className="mb-8 flex flex-col gap-3">
          <Tag tone="ink">Method &amp; limits</Tag>
          <h2 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.02em]">
            An honest scanner says what it <span className="font-serif font-normal italic tracking-normal text-amber">can&apos;t</span> see.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {LIMITS.map((l, i) => (
            <Reveal key={l.k} i={i} className="h-full">
              <div className="h-full bg-carbon p-6" data-ghost={l.ghost}>
                <Tag tone={l.tone}>{l.k}</Tag>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{l.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Source>
          Fingerprint uniqueness: P. Eckersley, “How Unique Is Your Web Browser?”, EFF / PETS 2010 — 83.6% of 470,161 browsers
          were uniquely identifiable. Per-attribute entropy values are ballpark figures (Panopticlick / AmIUnique) summed as if
          independent, so the total is an upper bound. Tool list & GPC guidance: Know Your Data toolkit (L. Muruganandam) and
          Sumayya&apos;s defence strategy; third-party-cookie status: Know Your Data §3 taxonomy.
        </Source>
      </Section>
    </div>
  );
}
