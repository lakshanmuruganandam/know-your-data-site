import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Vault } from "@/components/modules/vault/Vault";

export const metadata: Metadata = {
  title: "The Corporate Exploit Vault — Know Your Data",
  description:
    "Ten declassified case files on how companies harvested, sold and leaked personal data — Avast/Jumpshot, Cambridge Analytica, Google Incognito, National Public Data, Clearview AI, Equifax and more — with the exploit chain, the penalty and the lesson for you.",
};

export default function VaultPage() {
  return (
    <>
      <PageHeader
        index="02"
        kicker="The Corporate Exploit Vault"
        title="Every privacy promise has a"
        accent="paper trail."
        tone="crimson"
        lede={
          <>
            Ten case files, researched by Millennium Fellows and checked line by line. Each one shows what the company told you, what
            actually happened to your data, who paid for it — and how little the penalty cost. Open a file to declassify it.
          </>
        }
      />
      <Vault />
    </>
  );
}
