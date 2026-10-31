"use client";

import { toneBg, toneBorder, toneText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CATEGORY_META, SEVERITY_META, type Category, type Severity } from "@/lib/data/cases";

/* ── 5-segment severity meter ── */
export function SeverityMeter({ level, className }: { level: Severity; className?: string }) {
  const meta = SEVERITY_META[level];
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label={`Severity ${level} of 5: ${meta.label}`}>
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={cn("h-3 w-1.5 rounded-[1px]", s <= level ? toneBg[meta.tone] : "bg-white/10")} />
        ))}
      </span>
      <span className={cn("font-mono text-[10px] uppercase tracking-[0.2em]", toneText[meta.tone])}>{meta.label}</span>
    </span>
  );
}

/* ── category pill ── */
export function CategoryPill({ cat }: { cat: Category }) {
  const meta = CATEGORY_META[cat];
  return (
    <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", toneBorder[meta.tone], toneText[meta.tone])}>
      {meta.label}
    </span>
  );
}

/* ── rubber stamp ── */
export function Stamp({ children, tone, className }: { children: React.ReactNode; tone: keyof typeof toneText; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none inline-block -rotate-[9deg] rounded-sm border-2 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] mix-blend-screen",
        toneBorder[tone],
        toneText[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
