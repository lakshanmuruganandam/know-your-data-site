import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader, Reveal, Section, Tag } from "@/components/ui";
import { OpexCallout } from "@/components/modules/economics/Callout";
import { CostOfBusinessMatrix } from "@/components/modules/economics/CostOfBusinessMatrix";
import { BalanceShifting, DataValue, PricedIn, RepeatOffender } from "@/components/modules/economics/Evidence";
import { ExpectedCostSimulator } from "@/components/modules/economics/ExpectedCostSimulator";
import { RtbAuction } from "@/components/modules/economics/RtbAuction";

export const metadata: Metadata = {
  title: "The Economics of Exploitation — Know Your Data",
  description:
    "Why breaking privacy law can be the rational business choice: an expected-cost simulator, Meta's fines against its revenue, and a slowed-down real-time bidding auction of you. Based on research by Saatvik Sanka, Divyam Thakur and Gauri Nanda Salu.",
};

function Head({ n, kicker, title, accent, children, tone = "crimson" }: { n: string; kicker: string; title: string; accent: string; children: ReactNode; tone?: "crimson" | "amber" | "cyan" | "lime" }) {
  const accentCls = { crimson: "text-crimson", amber: "text-amber", cyan: "text-cyan", lime: "text-lime" }[tone];
  return (
    <Reveal className="mb-10 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-12">
      <div>
        <Tag tone={tone}>
          {n} — {kicker}
        </Tag>
        <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.025em]">
          {title} <span className={`font-serif font-normal italic tracking-normal ${accentCls}`}>{accent}</span>
        </h2>
      </div>
      <div className="max-w-xl text-[15.5px] leading-relaxed text-ink-2">{children}</div>
    </Reveal>
  );
}

export default function EconomicsPage() {
  return (
    <>
      <PageHeader
        index="03"
        kicker="Economics"
        title="The economics of"
        accent="exploitation."
        tone="crimson"
        lede={
          <>
            When the expected fine is smaller than the profit, breaking privacy law is not a scandal — it is a spreadsheet. This module turns the
            research of <span className="text-ink">Saatvik Sanka, Divyam Thakur &amp; Gauri Nanda Salu</span> into instruments you can play with.
          </>
        }
      />

      <Section id="simulator" className="pt-4">
        <Head n="01" kicker="Expected cost" title="Is breaking the law" accent="rational?" tone="amber">
          A company compares the profit it expects with the expected penalty: chance of being caught × chance it sticks × the fine, discounted for the
          years it takes to arrive. Slide the terms. Watch how rarely the verdict flips.
        </Head>
        <ExpectedCostSimulator />
      </Section>

      <Section id="matrix">
        <Head n="02" kicker="Cost of doing business" title="Nine fines," accent="one sliver.">
          Every grey cell below is one ten-thousandth of Meta’s 2025 revenue. The red cells are all nine penalties in the paper’s Table 1 —
          seven years of enforcement, set against a single year of income.
        </Head>
        <CostOfBusinessMatrix />
      </Section>

      <Section>
        <Reveal>
          <OpexCallout />
        </Reveal>
      </Section>

      <Section id="priced-in">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Head n="03" kicker="Priced in" title="The fine the market" accent="cheered." tone="lime">
              The best-documented case: the FTC’s $5B settlement with Facebook in 2019.
            </Head>
            <PricedIn />
          </div>
          <div className="lg:pt-2">
            <Head n="04" kicker="Repeat offending" title="Fined, fined," accent="fined again." tone="amber">
              If fines changed behaviour, the same violation would not keep returning.
            </Head>
            <RepeatOffender />
          </div>
        </div>
      </Section>

      <Section id="value">
        <Head n="05" kicker="The value side" title="What your data is" accent="worth." tone="cyan">
          The gain side of the equation. Read the fine print: an average revenue per user is not a price, and the academic evidence on the value
          of targeting is split.
        </Head>
        <DataValue />
      </Section>

      <Section id="auction">
        <Head n="06" kicker="Real-time bidding" title="You, sold in" accent="100 ms.">
          Each page load can trigger an auction: your profile is broadcast to bidders, bids return, the highest wins — and every loser keeps a copy.
          Here it is slowed down, priced with your own Shadow Profile.
        </Head>
        <RtbAuction />
      </Section>

      <Section id="shifting">
        <Head n="07" kicker="Counter-evidence" title="The balance is" accent="shifting." tone="lime">
          The “cost of doing business” argument should not be overstated. Total penalties are rising, and regulators have started targeting business
          models rather than individual breaches.
        </Head>
        <BalanceShifting />
        <Reveal className="mt-12 max-w-3xl">
          <p className="text-[17px] leading-relaxed text-ink-2" data-ghost="reached the conclusion → completion rate: rare · high-intent reader">
            <span className="text-ink">Verdict of the research:</span> so far, penalties have been weak relative to the gains of the largest firms.
            Deterrence will depend on penalties that scale with the value of the data, and on enforcement that is quick and consistent.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ink-3">
            Research: Saatvik Sanka · Divyam Thakur · Gauri Nanda Salu — “Economics of Personal Data”, Millennium Fellowship, Oct 2026. Fines are
            regulatory findings or settlements; some are contested. Educational, not financial or legal advice.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
