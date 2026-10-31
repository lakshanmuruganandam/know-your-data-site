import type { Metadata } from "next";
import { PageHeader, Reveal, Section, Source, Tag } from "@/components/ui";
import { ArticleExplorer, ScopeGuide } from "@/components/modules/legal/ArticleExplorer";
import { RequestGenerator } from "@/components/modules/legal/RequestGenerator";

export const metadata: Metadata = {
  title: "Legal Redress — UAE PDPL & GDPR Request Generator · Know Your Data",
  description:
    "Generate a formal data-access, objection or erasure request under UAE Federal Decree-Law No. 45 of 2021 (PDPL) or the GDPR. Runs entirely in your browser. Not legal advice.",
};

const COMPARE = [
  { right: "Access", pdpl: "Art. 13", gdpr: "Art. 15" },
  { right: "Portability", pdpl: "Art. 14", gdpr: "Art. 20" },
  { right: "Erasure", pdpl: "Art. 15", gdpr: "Art. 17" },
  { right: "Restriction", pdpl: "Art. 16", gdpr: "Art. 18" },
  { right: "Object to marketing", pdpl: "Art. 17", gdpr: "Art. 21(2)–(3)" },
  { right: "Automated decisions", pdpl: "Art. 18", gdpr: "Art. 22" },
  { right: "Response deadline", pdpl: "Not fixed — Executive Regulations", gdpr: "1 month, +2 (Art. 12(3))" },
];

export default function LegalPage() {
  return (
    <>
      <PageHeader
        index="05"
        kicker="Legal redress"
        title="Make them"
        accent="answer."
        tone="lime"
        lede={
          <>
            Since 2 January 2022, UAE residents can demand to see, stop and erase what companies hold on them under Federal Decree-Law No. 45 of 2021 (PDPL). Fill in four fields and get a formal,
            correctly-cited letter — PDPL, GDPR, or both.
          </>
        }
      />

      <Section id="generator" className="pt-0">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Tag tone="lime">Request generator</Tag>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Three letters. <span className="font-serif font-normal italic text-lime">Every</span> right.
              </h2>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed text-ink-3" data-ghost="dsar volume rising in AE → privacy ops headcount +2">
              Template A finds out what they know. B stops them using it. C makes them delete it.
            </p>
          </div>
        </Reveal>
        <RequestGenerator />
        <Source>
          Templates A–C adapted from L. Muruganandam, <em>Know Your Data</em> handbook §11.5; article numbers per Federal Decree-Law No. 45 of 2021 (uaelegislation.gov.ae/en/legislations/1972) and
          Regulation (EU) 2016/679.
        </Source>
      </Section>

      <Section id="articles">
        <Reveal>
          <Tag tone="cyan">Article explorer</Tag>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            What the law <span className="font-serif font-normal italic text-cyan">actually</span> says.
          </h2>
          <p className="mt-4 max-w-2xl text-ink-2">Click an article for a plain-English explainer, what you can demand, and the exemptions companies will reach for.</p>
        </Reveal>
        <div className="mt-10">
          <ArticleExplorer />
        </div>
        <Source>Plain-English paraphrases, not statutory text. Handbook §11.1 (article-level summary checked against the official PDPL text).</Source>
      </Section>

      <Section id="scope">
        <Reveal>
          <Tag tone="amber">Which law applies?</Tag>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            The PDPL has <span className="font-serif font-normal italic text-amber">edges.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-ink-2">
            Article 2 carves out government data, security and judicial bodies, health and banking data covered by their own laws, and free zones with their own regimes — DIFC and ADGM.
          </p>
        </Reveal>
        <div className="mt-10">
          <ScopeGuide />
        </div>

        <Reveal className="mt-14">
          <div className="glass overflow-hidden rounded-2xl" data-ghost="cross-jurisdiction comparison viewed → subject = high-effort opt-outer">
            <div className="border-b border-line px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">PDPL ↔ GDPR crosswalk</span>
            </div>
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
                  <th className="px-4 py-3 font-normal sm:px-5">Right</th>
                  <th className="px-2 py-3 font-normal text-lime sm:px-5">UAE PDPL</th>
                  <th className="px-4 py-3 font-normal text-cyan sm:px-5">EU GDPR</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.right} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink sm:px-5">{r.right}</td>
                    <td className="px-2 py-3 font-mono text-[12px] text-ink-2 sm:px-5">{r.pdpl}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-2 sm:px-5">{r.gdpr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Source>Handbook §11.2–11.3. Enforcement gaps: as of late 2026 the PDPL Executive Regulations were not confirmed as published and the UAE Data Office complaint process was not fully operational.</Source>
        </Reveal>
      </Section>
    </>
  );
}
