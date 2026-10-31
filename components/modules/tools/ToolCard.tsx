"use client";

import { Check, ExternalLink, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { E2E, Tool } from "@/lib/data/tools";

const e2eLabel: Record<E2E, { text: string; cls: string }> = {
  yes: { text: "Zero-knowledge", cls: "border-lime/40 text-lime" },
  partial: { text: "Partial E2E", cls: "border-amber/40 text-amber" },
  no: { text: "Provider can read", cls: "border-crimson/40 text-crimson" },
  na: { text: "E2E n/a", cls: "border-line-2 text-ink-3" },
};

export function UxMeter({ value }: { value: number }) {
  const tone = value >= 8 ? "bg-lime" : value >= 6 ? "bg-cyan" : "bg-amber";
  return (
    <div className="flex items-center gap-2" role="meter" aria-valuemin={1} aria-valuemax={10} aria-valuenow={value} aria-label="Ease of use">
      <div className="flex gap-[3px]">
        {Array.from({ length: 10 }, (_, k) => (
          <span key={k} className={cn("h-3 w-[5px] rounded-[1px]", k < value ? tone : "bg-white/[0.07]")} />
        ))}
      </div>
      <span className="font-mono text-[11px] tabular-nums text-ink-2">{value}/10</span>
    </div>
  );
}

export function ToolCardBody({ t, inStack, onStack }: { t: Tool; inStack: boolean; onStack: () => void }) {
  const e = e2eLabel[t.zeroKnowledge];
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">{t.category}</span>
          <h3 className="mt-1 truncate font-display text-xl font-bold tracking-tight">{t.name}</h3>
        </div>
        <button
          type="button"
          onClick={onStack}
          aria-pressed={inStack}
          aria-label={inStack ? `Remove ${t.name} from my stack` : `Add ${t.name} to my stack as ${t.category}`}
          data-ghost={inStack ? "stack locked in → subject's monthly yield: falling" : "stack builder → adoption intent: high"}
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-cyan",
            inStack ? "border-lime bg-lime text-void" : "border-line-2 text-ink-2 hover:border-lime/60 hover:text-lime",
          )}
        >
          {inStack ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>

      <p className="mt-1 font-mono text-[11px] leading-snug text-ink-3">
        replaces{" "}
        {t.replaces.map((r, k) => (
          <span key={r}>
            <span className="text-crimson/85 line-through decoration-crimson/70">{r}</span>
            {k < t.replaces.length - 1 && ", "}
          </span>
        ))}
      </p>

      <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{t.oneLiner}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge cls={t.openSource ? "border-lime/40 text-lime" : "border-line-2 text-ink-3"}>{t.openSource ? "Open source" : "Closed source"}</Badge>
        {t.selfHostable && <Badge cls="border-cyan/40 text-cyan">Self-host</Badge>}
        <Badge cls={e.cls}>{e.text}</Badge>
      </div>
      {t.note && <p className="mt-2 font-mono text-[10.5px] leading-snug text-ink-3">※ {t.note}</p>}

      <div className="mt-3 flex flex-wrap gap-1">
        {t.protocols.map((p) => (
          <span key={p} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2">
            {p}
          </span>
        ))}
      </div>

      <div className="mt-auto space-y-3 pt-5">
        <UxMeter value={t.ux} />
        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 font-mono text-[10.5px]">
          <div className="min-w-0">
            <dt className="uppercase tracking-[0.18em] text-ink-3">Jurisdiction</dt>
            <dd className="mt-0.5 text-ink-2">{t.jurisdiction}</dd>
          </div>
          <div className="min-w-0">
            <dt className="uppercase tracking-[0.18em] text-ink-3">Cost</dt>
            <dd className={cn("mt-0.5", t.free ? "text-ink-2" : "text-amber")}>{t.cost}</dd>
          </div>
        </dl>
        <a
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 font-mono text-[11px] text-ink-3 transition-colors hover:text-cyan"
          data-ghost="outbound click → referrer stripped (noreferrer)"
        >
          <span className="truncate">{t.url.replace(/^https?:\/\//, "")}</span>
          <ExternalLink size={11} className="shrink-0" />
        </a>
      </div>
    </div>
  );
}

function Badge({ children, cls }: { children: ReactNode; cls: string }) {
  return <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", cls)}>{children}</span>;
}
