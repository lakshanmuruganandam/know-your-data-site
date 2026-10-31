import type { Metadata } from "next";
import { PageHeader, Reveal, Section, Source, Tag } from "@/components/ui";
import { Layers } from "@/components/modules/defense/Layers";
import { Toolkit } from "@/components/modules/defense/Toolkit";

export const metadata: Metadata = {
  title: "The 4-Layer Defense Playbook — Know Your Data",
  description:
    "A 90-minute, all-free self-defense toolkit plus copy-paste configs for the four layers: browser, network, OS & device, and identity. Watch your shadow profile go dark as you go.",
};

const CREDITS = [
  { name: "Lakshan Muruganandam", what: "Master dossier — 7-step toolkit, 4-layer configs, PDPL kit" },
  { name: "Farha Hareesh", what: "Browser & tracking defenses, hardening checklist" },
  { name: "Sumayya", what: "Measure → protect → re-measure method, phone & OS telemetry steps" },
];

export default function DefensePage() {
  return (
    <div>
      <PageHeader
        index="04"
        kicker="Defense"
        title="The 4-Layer Defense"
        accent="playbook"
        tone="lime"
        lede={
          <>
            Seven moves, about ninety minutes, all free. Every box you tick here <span className="text-lime">redacts a field</span> in
            the shadow profile on the right — and your live auction price falls with it. Then go deeper, layer by layer, with configs you
            can paste.
          </>
        }
      />

      <Section id="toolkit" className="pt-4">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div data-ghost="user started a privacy checklist → churn-risk segment for ad buyers">
              <Tag tone="cyan">01 — The 90-minute toolkit</Tag>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.02em]">
                One sitting. Seven moves.{" "}
                <span className="font-serif font-normal italic tracking-normal text-cyan">Zero cost.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-2">
              Do them in order. Measure first at EFF Cover Your Tracks, then measure again at the end — the before/after is the point.
              Progress is saved on this device only.
            </p>
          </div>
        </Reveal>
        <Toolkit />
      </Section>

      <Section id="layers">
        <Reveal>
          <div className="mb-10 max-w-3xl" data-ghost="reading vpn configs → segment: tech-savvy · ad-block likely">
            <Tag tone="lime">02 — The four layers</Tag>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.02em]">
              Each layer fails{" "}
              <span className="font-serif font-normal italic tracking-normal text-lime">differently.</span>
            </h2>
            <p className="mt-5 text-ink-2">
              Browser defences do nothing against apps. A VPN does nothing against fingerprinting. Nothing technical stops a service you
              log into from using what you give it — that&apos;s what the law is for. Click a ring to open its armour.
            </p>
          </div>
        </Reveal>
        <Layers />
      </Section>

      <Section className="pb-28">
        <Reveal>
          <div className="glass rounded-2xl p-5 sm:p-6" data-ghost="credits viewed → research cohort: iitd abu dhabi">
            <Tag tone="ink">Research credits</Tag>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {CREDITS.map((c) => (
                <li key={c.name}>
                  <p className="font-display text-lg font-bold">{c.name}</p>
                  <p className="mt-1 text-sm text-ink-2">{c.what}</p>
                </li>
              ))}
            </ul>
            <Source>
              Settings and flags change with each release; values are correct for late-2026 versions and should be re-checked. Never
              change policies IT controls on a university-managed device. Millennium Fellowship 2026 · IIT Delhi Abu Dhabi.
            </Source>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
