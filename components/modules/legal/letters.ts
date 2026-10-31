/* Letter builder for the PDPL / GDPR request generator.
 * Wording adapted from Templates A–C in Lakshan Muruganandam's "Know Your Data" handbook §11.5.
 * Pure functions — nothing here touches the network or storage.
 */

export type Juris = "pdpl" | "gdpr" | "both";
export type TemplateId = "A" | "B" | "C";

export type BClause = "consent" | "marketing" | "automated" | "sharing" | "notify";
export type CGround = "purpose" | "consent" | "objection" | "unlawful";

export interface LetterInput {
  name: string;
  account: string;
  company: string;
  privacyEmail: string;
  date: string | null;
  juris: Juris;
  template: TemplateId;
  bClauses: Record<BClause, boolean>;
  cGrounds: Record<CGround, boolean>;
}

export const TEMPLATES: { id: TemplateId; title: string; short: string; pdpl: string; gdpr: string; ghost: string }[] = [
  {
    id: "A",
    title: "Access & inventory",
    short: "Everything you hold on me, where you got it, who you sold it to.",
    pdpl: "Art. 13 (+14)",
    gdpr: "Art. 15 (+20)",
    ghost: "subject requested own dossier → legal review queue · cost +$38/ticket",
  },
  {
    id: "B",
    title: "Stop marketing & profiling",
    short: "Withdraw consent, object to direct marketing, demand human review.",
    pdpl: "Arts. 6, 17, 18",
    gdpr: "Arts. 7(3), 21, 22",
    ghost: "opt-out filed → segment 'reachable' revoked · LTV −$4.10",
  },
  {
    id: "C",
    title: "Erase everything",
    short: "Permanent deletion, processors included, restriction until done.",
    pdpl: "Art. 15 (+16)",
    gdpr: "Art. 17 (+18)",
    ghost: "erasure request → shadow profile scheduled for deletion",
  },
];

export const B_CLAUSES: { id: BClause; label: string }[] = [
  { id: "consent", label: "Withdraw consent for marketing / sharing" },
  { id: "marketing", label: "Object to direct marketing & profiling" },
  { id: "automated", label: "Object to automated decisions, ask for human review" },
  { id: "sharing", label: "Stop selling / sharing with ad partners" },
  { id: "notify", label: "Notify every third party who received my data" },
];

export const C_GROUNDS: { id: CGround; label: string }[] = [
  { id: "purpose", label: "No longer needed for its original purpose" },
  { id: "consent", label: "I withdraw my consent" },
  { id: "objection", label: "I object and there are no overriding grounds" },
  { id: "unlawful", label: "The processing is unlawful" },
];

const PH = {
  name: "[Full name]",
  account: "[email / account ID]",
  company: "[Company name]",
  date: "[Date]",
};

/** pick citation text by jurisdiction */
function cite(j: Juris, pdpl: string, gdpr: string) {
  if (j === "pdpl") return `PDPL ${pdpl}`;
  if (j === "gdpr") return `GDPR ${gdpr}`;
  return `PDPL ${pdpl}; GDPR ${gdpr} where applicable`;
}

export function lawName(j: Juris) {
  if (j === "pdpl") return "UAE Federal Decree-Law No. 45 of 2021 (PDPL)";
  if (j === "gdpr") return "the GDPR (Regulation (EU) 2016/679)";
  return "UAE Federal Decree-Law No. 45 of 2021 (PDPL) and the GDPR";
}

function deadline(j: Juris, action: string) {
  if (j === "pdpl") return `Please ${action} within 30 days.`;
  if (j === "gdpr") return `Please ${action} without undue delay and in any event within one month of receipt, as required by GDPR Article 12(3).`;
  return `Please ${action} within 30 days, and in any event within the one-month period set by GDPR Article 12(3) where the GDPR applies.`;
}

export function buildLetter(i: LetterInput): { subject: string; body: string } {
  const name = i.name.trim() || PH.name;
  const account = i.account.trim() || PH.account;
  const company = i.company.trim() || PH.company;
  const date = i.date ?? PH.date;
  const j = i.juris;
  const resident = j === "gdpr" ? "I am" : "I am a resident of the United Arab Emirates and";

  const head = [`To the Data Protection Officer, ${company}`, i.privacyEmail.trim() ? `By email: ${i.privacyEmail.trim()}` : null, "", `Account: ${account}`, ""]
    .filter((l) => l !== null)
    .join("\n");
  const sign = `\n\nYours sincerely,\n${name}\n${date}`;

  if (i.template === "A") {
    const subject =
      j === "pdpl"
        ? "Data subject request for information and access - UAE Federal Decree-Law No. 45 of 2021, Article 13"
        : j === "gdpr"
          ? "Data subject access request - GDPR Article 15"
          : "Data subject request for access - PDPL Article 13 and GDPR Article 15";
    const basis =
      j === "pdpl"
        ? "Under Article 13 of Federal Decree-Law No. 45 of 2021 (PDPL), I request, free of charge:"
        : j === "gdpr"
          ? "Under Article 15 of the GDPR, I request confirmation of whether you process my personal data and, free of charge:"
          : "Under Article 13 of Federal Decree-Law No. 45 of 2021 (PDPL), and Article 15 of the GDPR where it applies, I request, free of charge:";
    const port = j === "pdpl" ? "PDPL Article 14" : j === "gdpr" ? "GDPR Article 20" : "PDPL Article 14 (GDPR Article 20)";
    const body = [
      head,
      `${resident} a user of ${company}, registered with ${account}.`,
      basis,
      "",
      "1. A copy of all personal data you hold about me, including data you have inferred or derived (interest segments, scores, predictions).",
      "2. The purposes and legal basis for each category of processing.",
      `3. The sources of any data you did not collect from me directly, including data brokers, advertising partners and "customer list" uploads.`,
      `4. The recipients or categories of recipients, ${j === "gdpr" ? "including any outside the EU" : "inside and outside the UAE"}, and the safeguards used for transfers abroad.`,
      "5. Any decisions about me based on automated processing, including profiling, and the logic involved.",
      "6. How long each category of data will be kept.",
      `7. Under ${port}, the data I provided, in a structured, machine-readable format (e.g. JSON or CSV).`,
      "",
      deadline(j, "respond"),
      "If you need to verify my identity, please do so using my logged-in account or this email address.",
      "If you refuse any part of this request, please state the legal exception relied on.",
    ].join("\n");
    return { subject, body: body + sign };
  }

  if (i.template === "B") {
    const subject =
      j === "pdpl"
        ? "Objection to direct marketing, profiling and sharing of my data - PDPL Articles 6, 17 and 18"
        : j === "gdpr"
          ? "Withdrawal of consent and objection to direct marketing and profiling - GDPR Articles 7(3), 21 and 22"
          : "Objection to direct marketing, profiling and sharing of my data - PDPL Articles 6, 17 and 18; GDPR Articles 21 and 22";
    const lines: string[] = [];
    const on = i.bClauses;
    if (on.consent) lines.push(`Withdraw any consent I have given for marketing, advertising or data sharing (${cite(j, "Article 6", "Article 7(3)")}).`);
    if (on.marketing) lines.push(`Object to all processing of my personal data for direct marketing, including related profiling (${cite(j, "Article 17", "Article 21(2)–(3)")}).`);
    if (on.automated)
      lines.push(`Object to any decision about me based solely on automated processing, including profiling, and request human review of any such decision (${cite(j, "Article 18", "Article 22")}).`);
    if (on.sharing)
      lines.push("Require that you stop selling, renting, sharing or disclosing my personal data to third parties for advertising, audience-building or data-enrichment purposes, including hashed identifiers sent to advertising platforms.");
    if (on.notify) lines.push("Ask you to notify every third party to whom you have disclosed my data for these purposes of this objection.");
    const list = lines.length ? lines.map((l, k) => `${k + 1}. ${l}`).join("\n") : "[Select at least one clause]";
    const body = [
      head,
      "With immediate effect, I:",
      "",
      list,
      "",
      deadline(j, "confirm in writing that this has been done" + (on.notify ? " and list the third parties you notified" : "")),
    ].join("\n");
    return { subject, body: body + sign };
  }

  // Template C
  const subject =
    j === "pdpl"
      ? "Request for erasure of all my personal data - PDPL Article 15"
      : j === "gdpr"
        ? "Request for erasure of all my personal data - GDPR Article 17"
        : "Request for erasure of all my personal data - PDPL Article 15 and GDPR Article 17";
  const basis =
    j === "pdpl"
      ? "Under Article 15 of Federal Decree-Law No. 45 of 2021 (PDPL), I request erasure of all personal data you hold about me, because:"
      : j === "gdpr"
        ? "Under Article 17 of the GDPR, I request erasure of all personal data you hold about me, because:"
        : "Under Article 15 of Federal Decree-Law No. 45 of 2021 (PDPL), and Article 17 of the GDPR where it applies, I request erasure of all personal data you hold about me, because:";
  const groundText: Record<CGround, string> = {
    purpose: "the data is no longer needed for the purpose it was collected for;",
    consent: "I withdraw my consent;",
    objection: "I object to the processing and there are no overriding grounds;",
    unlawful: j === "gdpr" ? "the processing is unlawful." : j === "pdpl" ? "the processing does not comply with the PDPL." : "the processing does not comply with the applicable law.",
  };
  const picked = C_GROUNDS.filter((g) => i.cGrounds[g.id]);
  const grounds = picked.length
    ? picked.map((g, k) => `[x] ${groundText[g.id]}`.replace(/;$/, k === picked.length - 1 ? "." : ";"))
    : C_GROUNDS.map((g) => `[ ] ${groundText[g.id]}`);
  const body = [
    head,
    basis,
    ...grounds,
    "",
    "This includes account data, content, device and usage data, inferred data, backups once they cycle, and copies held by your processors.",
    "Please also:",
    `1. Close my account (${account}).`,
    "2. Instruct your processors and any third parties who received my data to erase it.",
    `3. Confirm in writing ${
      j === "pdpl" ? "within 30 days" : j === "gdpr" ? "within one month of receipt (GDPR Article 12(3))" : "within 30 days (and within the one-month period of GDPR Article 12(3) where it applies)"
    } the date of erasure, any data you are legally required to keep, the law that requires it, and how long it will be kept.`,
    "",
    `Until erasure is complete, I ask you to restrict processing of my data under ${cite(j, "Article 16", "Article 18")}.`,
  ].join("\n");
  return { subject, body: body + sign };
}

/** Matches statutory citations so the preview can highlight them. Capturing group → odd split indices. */
export const CITE_RE =
  /((?:PDPL|GDPR) Articles? \d+(?:\(\d\))?(?:–\(\d\))?(?:(?:, | and )\d+(?:\(\d\))?)*|Articles? \d+(?:\(\d\))?(?:–\(\d\))? of (?:Federal Decree-Law No\. 45 of 2021(?: \(PDPL\))?|the GDPR)|Federal Decree-Law No\. 45 of 2021(?: \(PDPL\))?|GDPR Article \d+(?:\(\d\))?)/g;

export const PLACEHOLDER_RE = /(\[[A-Za-z][^\]\n]+\])/g;

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d;
}
export function addMonths(iso: string, months: number) {
  const d = new Date(iso + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  return d;
}
export const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
