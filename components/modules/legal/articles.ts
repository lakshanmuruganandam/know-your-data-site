/* Plain-English article summaries — UAE Federal Decree-Law No. 45 of 2021 (PDPL).
 * Summaries follow the handbook §11.1–11.3 (article-level summary checked against the official text at
 * uaelegislation.gov.ae/en/legislations/1972). These are simplified paraphrases, not the statutory wording.
 */

export interface Article {
  art: string;
  title: string;
  group: "Scope" | "Lawful basis" | "Your rights" | "Enforcement";
  plain: string;
  demand: string[];
  exemptions: string[];
  gdpr: string;
  ghost: string;
}

export const ARTICLES: Article[] = [
  {
    art: "2",
    title: "Scope — who the law covers",
    group: "Scope",
    plain:
      "The PDPL protects people living or working in the UAE. It binds controllers and processors inside the UAE, and those abroad who process the data of people in the UAE.",
    demand: ["Applies to most apps and websites you use from the UAE, even if the company is based abroad."],
    exemptions: [
      "Government data, and government authorities that control or process data",
      "Data held by security and judicial authorities",
      "Data you process purely for your own personal purposes",
      "Health and banking/credit data already covered by their own legislation",
      "Companies in free zones with their own data protection law — DIFC (DP Law No. 5 of 2020) and ADGM (DP Regulations 2021)",
    ],
    gdpr: "GDPR Art. 3 — territorial scope (EU establishment, or targeting/monitoring people in the EU)",
    ghost: "jurisdiction lookup → subject is uae-resident · pdpl applies",
  },
  {
    art: "4",
    title: "Processing without consent",
    group: "Lawful basis",
    plain:
      "Consent is the default, but Article 4 lists situations where a company may process your data without asking. If a company relies on one of these, a consent withdrawal won't stop it — ask which one (Template A).",
    demand: ["Ask the company which Article 4 ground it relies on for each processing purpose."],
    exemptions: [
      "Protecting the public interest",
      "Data you have made public yourself",
      "Bringing or defending legal claims; judicial or security procedures",
      "Occupational/preventive medicine, diagnosis, health or social care, health insurance",
      "Protecting public health, including epidemics, and the safety of medicines and devices",
      "Archiving, or scientific, historical and statistical research",
      "Protecting your own interests",
      "Employment, social-security and social-protection obligations",
      "Preparing or performing a contract you are party to",
      "Complying with obligations under other UAE laws",
      "Other cases set by the Executive Regulations",
    ],
    gdpr: "GDPR Art. 6(1) — the six lawful bases (consent is only one of them)",
    ghost: "lawful basis = 'contract' claimed → consent toggle cosmetic",
  },
  {
    art: "6",
    title: "Conditions for valid consent",
    group: "Lawful basis",
    plain:
      "Where a company relies on consent, it must be able to prove you gave it, in clear, simple, unambiguous terms — and you can withdraw it at any time, as easily as you gave it.",
    demand: ["Withdraw consent for marketing, ads or data sharing at any time (Template B)", "Ask for proof of when and how you consented"],
    exemptions: ["Processing done before you withdrew stays lawful", "Doesn't stop processing based on an Article 4 ground"],
    gdpr: "GDPR Art. 7 — conditions for consent; 7(3) withdrawal as easy as giving",
    ghost: "consent banner dwell 0.8s → 'accept all' logged as informed",
  },
  {
    art: "13",
    title: "Right to obtain information (access)",
    group: "Your rights",
    plain:
      "Free of charge, you can demand to know what data a company holds about you, why, who it was shared with (inside and outside the UAE), how long it's kept, and whether automated decisions or profiling are used.",
    demand: [
      "Types of data held and purposes",
      "Automated decisions and profiling",
      "Recipients inside and outside the UAE, and transfer safeguards",
      "Retention periods and how to complain",
    ],
    exemptions: [
      "Unrelated or excessively repetitive requests",
      "Conflicts with investigations or court procedures",
      "Harm to security or to other people's privacy",
    ],
    gdpr: "GDPR Art. 15 — right of access (copy of the data + the same context)",
    ghost: "dsar received → inferred segments must now be disclosed",
  },
  {
    art: "14",
    title: "Data portability",
    group: "Your rights",
    plain: "You can get the data you provided in a structured, machine-readable format, or have it sent directly to another company where technically feasible.",
    demand: ["Your data as JSON/CSV", "Direct transfer to a competitor"],
    exemptions: ["Only data you provided, processed by consent or contract, by automated means"],
    gdpr: "GDPR Art. 20 — right to data portability",
    ghost: "export requested → switching cost of subject ↓",
  },
  {
    art: "15",
    title: "Correction and erasure",
    group: "Your rights",
    plain:
      "Fix inaccurate data without undue delay, and have data erased when it's no longer needed, when you withdraw consent, when you object, or when the processing breaks the law.",
    demand: ["Correction of wrong data", "Erasure of everything, processors included (Template C)"],
    exemptions: [
      "Public-health data held by private facilities",
      "Data needed for legal claims or investigations",
      "Other laws that require the company to keep it",
    ],
    gdpr: "GDPR Arts. 16 (rectification) and 17 (erasure — 'right to be forgotten')",
    ghost: "erasure request → id graph node orphaned · re-identification risk",
  },
  {
    art: "16",
    title: "Restriction of processing",
    group: "Your rights",
    plain:
      "Freeze processing (storage only) while you dispute accuracy, when processing exceeds the agreed purposes, or when it breaks the law — useful while an erasure request is pending.",
    demand: ["A processing freeze until your dispute or erasure is resolved"],
    exemptions: ["Storage itself continues", "Legal claims", "Protecting third-party rights", "Public interest"],
    gdpr: "GDPR Art. 18 — right to restriction of processing",
    ghost: "processing frozen → subject removed from active audiences",
  },
  {
    art: "17",
    title: "Right to stop processing (objection)",
    group: "Your rights",
    plain:
      "Object to — and stop — processing for direct marketing including related profiling, for statistical surveys, or any processing that breaches the Article 5 principles.",
    demand: ["Stop marketing emails, SMS and ad-targeting profiles (Template B)"],
    exemptions: ["Statistical surveys necessary for the public interest"],
    gdpr: "GDPR Art. 21 — right to object; 21(2)–(3) marketing objection is absolute",
    ghost: "marketing objection logged → suppression list +1",
  },
  {
    art: "18",
    title: "Automated decisions & profiling",
    group: "Your rights",
    plain:
      "Object to decisions made solely by automated processing, including profiling, that have legal or similarly serious effects on you — and request human review.",
    demand: ["A human to review an automated rejection, score or ban (Template B)"],
    exemptions: ["Needed for a contract with you", "Allowed by another UAE law", "You consented beforehand — human review is still available"],
    gdpr: "GDPR Art. 22 — automated individual decision-making",
    ghost: "model decision contested → human-in-loop cost incurred",
  },
  {
    art: "24",
    title: "Complaint to the UAE Data Office",
    group: "Enforcement",
    plain:
      "If you believe your data was processed in breach of the law, you can complain to the UAE Data Office (set up by Federal Decree-Law No. 44 of 2021). As of late 2026 its complaint process was not yet fully operational.",
    demand: ["Escalate when a company ignores you — chase after 30 days first"],
    exemptions: ["Depends on the Data Office's procedures, which are still being set out"],
    gdpr: "GDPR Art. 77 — complaint to a supervisory authority",
    ghost: "regulator escalation risk → priority: respond",
  },
];

export interface Regime {
  id: string;
  where: string;
  law: string;
  regulator: string;
  note: string;
}

export const REGIMES: Regime[] = [
  { id: "mainland", where: "Mainland UAE or abroad (most apps)", law: "PDPL — Federal Decree-Law No. 45 of 2021", regulator: "UAE Data Office", note: "Use the PDPL templates. Response period not yet fixed — chase at 30 days." },
  { id: "adgm", where: "Abu Dhabi Global Market (ADGM)", law: "ADGM Data Protection Regulations 2021", regulator: "ADGM Office of Data Protection", note: "GDPR-style regime; response within one month. Use the GDPR wording." },
  { id: "difc", where: "Dubai International Financial Centre (DIFC)", law: "DIFC Data Protection Law No. 5 of 2020", regulator: "DIFC Commissioner of Data Protection", note: "GDPR-style regime with its own article numbers — the GDPR wording is the closer fit." },
  { id: "bank", where: "UAE bank or payment company", law: "Central Bank law & Consumer Protection Regulation", regulator: "Central Bank of the UAE (Sanadak ombudsman)", note: "Banking data with its own law is outside the PDPL." },
  { id: "telecom", where: "Telecoms (e&, du)", law: "TDRA regulations", regulator: "TDRA", note: "Sector regulator handles complaints." },
  { id: "gov", where: "Government entity", law: "Outside the PDPL (Art. 2)", regulator: "The entity's own channels / emirate-level rules", note: "Government data is excluded from the PDPL." },
  { id: "eu", where: "EU-established company", law: "GDPR may apply under Art. 3(1)", regulator: "The company's lead EU supervisory authority", note: "Pick 'Both' to cite PDPL and GDPR together." },
];
