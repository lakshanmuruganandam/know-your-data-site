import type { Metadata } from "next";
import { PageHeader, Reveal, Section, Source, Tag } from "@/components/ui";
import { ToolsExplorer } from "@/components/modules/tools/ToolsExplorer";

export const metadata: Metadata = {
  title: "Privacy Tools Directory & Big Tech Replacement Matrix · Know Your Data",
  description:
    "Swap Google Search, Chrome, WhatsApp, Gmail, Drive and 8.8.8.8 for open-source, zero-knowledge alternatives. Filter by open source, self-hostable and end-to-end encryption, then build your own stack.",
};

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        index="06"
        kicker="Replacement stack"
        title="Swap the"
        accent="defaults."
        tone="cyan"
        lede={
          <>
            The biggest gains for the least effort are Signal, a zero-knowledge password manager and an email-alias service — search and cloud storage come next. Every tool here is rated for
            licence, encryption, jurisdiction and how much it will annoy you.
          </>
        }
      />

      <ToolsExplorer />

      <Section className="pt-0">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-6" data-ghost="uae network detected → voip restricted · messaging allowed">
              <Tag tone="amber">UAE calling note</Tag>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                WhatsApp and FaceTime voice calls are restricted on UAE networks, and other VoIP apps may be too. Messaging works. Licensed apps such as Botim work for calls, but they are not end-to-end
                private in the same way.
              </p>
            </div>
            <div className="glass rounded-2xl p-6" data-ghost="vpn usage flagged → lawful-use context required">
              <Tag tone="amber">UAE VPN note</Tag>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                The TDRA has stated VPNs are not banned for legitimate use, but Federal Decree-Law No. 34 of 2021 penalises using a VPN or false IP to commit a crime or avoid detection. On campus Wi-Fi,
                follow the university&apos;s acceptable-use policy. Encrypted DNS is a standard browser feature, not a circumvention tool.
              </p>
            </div>
          </div>
          <Source>
            L. Muruganandam, <em>Know Your Data</em> handbook §5 (UAE note) and §9 (replacement stack). &ldquo;Zero-knowledge&rdquo; = the provider cannot read your content because the keys never
            leave your devices.
          </Source>
        </Reveal>
      </Section>
    </>
  );
}
