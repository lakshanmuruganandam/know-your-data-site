"use client";

import { useMotionValue } from "framer-motion";
import { cn } from "@/lib/cn";
import { chapterTc, SCENES } from "./Film";
import { CHAPTERS, toneText, type Chapter, type Packet } from "./model";

/** representative still frame per chapter */
const FRAME: Record<Chapter["id"], number> = { click: 0.92, pixel: 0.95, auction: 0.9, broker: 1, breach: 0.62, shield: 1 };

function Still({ c, packets, price }: { c: Chapter; packets: Packet[]; price: number }) {
  const t = useMotionValue(FRAME[c.id]);
  const Scene = SCENES[c.id];
  return (
    <div className="relative h-[400px] overflow-hidden rounded-2xl border border-line bg-void sm:h-[480px]" aria-hidden={c.id === "shield" ? undefined : true}>
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="absolute inset-3 sm:inset-6">
        <Scene t={t} packets={packets} price={price} />
      </div>
    </div>
  );
}

/** prefers-reduced-motion: the film as a static vertical storyboard */
export function Storyboard({ packets, price }: { packets: Packet[]; price: number }) {
  return (
    <section id="journey" aria-label="The 200 milliseconds after you click" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-crimson">{"// the ghost layer, frame by frame"}</div>
      <h2 className="mt-5 font-display text-[clamp(2.4rem,7vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
        The 200 milliseconds <span className="font-serif font-normal italic text-cyan">after you click.</span>
      </h2>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-2">Six stills, cast with your own browser&apos;s data. The timeline is illustrative; the data is yours.</p>
      <ol className="mt-14 space-y-16">
        {CHAPTERS.map((c) => (
          <li key={c.id} className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-center" data-ghost={c.ghost}>
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink-3">
                ch {c.n} / 06 <span className={toneText[c.tone]}>· {chapterTc(c)}</span>
              </div>
              <h3 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">
                {c.title} <span className={cn("font-serif font-normal italic", toneText[c.tone])}>{c.accent}</span>
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">{c.caption}</p>
            </div>
            <Still c={c} packets={packets} price={price} />
          </li>
        ))}
      </ol>
    </section>
  );
}
