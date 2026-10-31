/**
 * THE CORPORATE EXPLOIT VAULT — case data.
 *
 * Every number is checked against the student research texts (see `sources` + `authors` on each case).
 * Where a fact comes from the public record rather than the student texts, the source line says
 * "Public record" so it can be re-verified before publication. Row counts are NOT people counts.
 * Currency conversions to USD are approximate (rate near the decision date) and only used for totals/bars.
 */

export type Category = "spyware" | "broker" | "biometric" | "dark-pattern" | "tracking" | "breach";
export type Severity = 1 | 2 | 3 | 4 | 5;
export type CaseTone = "cyan" | "lime" | "amber" | "crimson" | "ink";

export type PenaltyStatus = "final" | "settled" | "appealed" | "overturned" | "pending" | "none";

export interface Penalty {
  authority: string;
  year: string;
  amount: string;
  /** approximate USD value, used for the stat strip total */
  usd: number;
  status: PenaltyStatus;
  /** include in the vault-wide "fines & settlements" total */
  counted: boolean;
  note?: string;
}

export interface ChainNode {
  label: string;
  sub: string;
}

export interface LedgerBar {
  label: string;
  value: number;
  display: string;
  tone: CaseTone;
}

export interface VaultCase {
  id: string;
  file: string;
  company: string;
  years: string;
  codename: string;
  categories: Category[];
  severity: Severity;
  headline: string;
  scale: { value: number; display: string; unit: string; note: string };
  deception: { claim: string; detail: string };
  reality: string[];
  exploit: string[];
  chain: { nodes: ChainNode[]; packets: string[] };
  gain: string;
  penalties: Penalty[];
  ledger: { title: string; bars: LedgerBar[]; note: string };
  outcome: string;
  lesson: string[];
  sources: string[];
  authors: string;
  ghost: string;
  /** honesty notes: discrepancies, contested facts */
  caveat?: string;
}

export const CATEGORY_META: Record<Category, { label: string; tone: CaseTone; ghost: string }> = {
  spyware: { label: "Spyware", tone: "crimson", ghost: "filter=spyware → user distrusts 'free' security · flag: privacy-aware" },
  broker: { label: "Data broker", tone: "amber", ghost: "filter=broker → curious about own dossier · opt-out risk: high" },
  biometric: { label: "Biometric", tone: "crimson", ghost: "filter=biometric → face-data concern · segment: civil-liberties" },
  "dark-pattern": { label: "Dark pattern", tone: "amber", ghost: "filter=dark-pattern → banner-resistant · consent rate ↓ 31%" },
  tracking: { label: "Tracking", tone: "cyan", ghost: "filter=tracking → likely runs a blocker · fingerprint harder" },
  breach: { label: "Breach", tone: "crimson", ghost: "filter=breach → identity-theft anxiety · upsell: credit monitoring" },
};

export const SEVERITY_META: Record<Severity, { label: string; tone: CaseTone }> = {
  5: { label: "Critical", tone: "crimson" },
  4: { label: "Severe", tone: "crimson" },
  3: { label: "High", tone: "amber" },
  2: { label: "Elevated", tone: "amber" },
  1: { label: "Guarded", tone: "cyan" },
};

export const cases: VaultCase[] = [
  /* ───────────────────────── 01 · AVAST / JUMPSHOT ───────────────────────── */
  {
    id: "avast-jumpshot",
    file: "01",
    company: "Avast & Jumpshot",
    years: "2014–2020",
    codename: "OPERATION ALL CLICKS",
    categories: ["spyware", "tracking", "broker"],
    severity: 4,
    headline: "An antivirus sold as anti-tracking quietly sold the browsing history it promised to protect.",
    scale: { value: 100_000_000, display: "~100M", unit: "users' browsing data sold", note: "FTC finding, per Anesh's case study" },
    deception: {
      claim: "“Protects you from online tracking and keeps your browsing private.”",
      detail: "Avast marketed its free antivirus and browser extensions as privacy tools, and said any data it kept was de-identified and aggregated.",
    },
    reality: [
      "The software and its extensions sent every search, page visit and timestamp back to Avast.",
      "Subsidiary Jumpshot attached a persistent identifier to each record and sold the stream to more than 100 third parties.",
      "Leaked documents showed individual Google Maps lookups, YouTube videos and LinkedIn pages in the sold data.",
    ],
    exploit: [
      "User installs free Avast/AVG antivirus or the Avast / AVG Online Security browser extension — sold as protection against tracking.",
      "The extension reports searches, URLs visited and timestamps back to Avast's servers.",
      "Avast pipes the stream to its subsidiary Jumpshot, which tags every record with a persistent device identifier.",
      "Jumpshot packages it as data feeds — reportedly including an “All Clicks Feed” of every page a user visited.",
      "Buyers (the leak listed Google, Microsoft, Pepsi, Home Depot, McKinsey) follow one person across sites and join it with data they already hold.",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "installs antivirus" },
        { label: "Avast extension", sub: "logs every click" },
        { label: "Jumpshot", sub: "adds persistent ID" },
        { label: "100+ buyers", sub: "marketing & analytics" },
      ],
      packets: ["search · url · ts", "device_id=7f3a…", "All Clicks Feed"],
    },
    gain: "Jumpshot's revenue from the feeds was never published in the sources reviewed — the commercial value is the persistent, re-identifiable click-stream of ~100 million people.",
    penalties: [
      { authority: "US FTC", year: "2024", amount: "$16.5M + ban on selling browsing data for advertising", usd: 16_500_000, status: "settled", counted: true, note: "Also: delete Jumpshot data, notify users, tell buyers to delete, adopt a privacy program." },
      { authority: "Czech data protection authority", year: "2024", amount: "≈ CZK 351M (≈ $15M)", usd: 15_000_000, status: "final", counted: true, note: "Reported figure; same practice." },
    ],
    ledger: {
      title: "Penalties vs. the people sold",
      bars: [
        { label: "FTC settlement", value: 16.5, display: "$16.5M", tone: "crimson" },
        { label: "Czech DPA fine", value: 15, display: "≈ $15M", tone: "crimson" },
      ],
      note: "≈ $0.32 in combined penalties per affected user (≈ $31.5M ÷ ~100M). Jumpshot's own earnings were not disclosed.",
    },
    outcome: "Mozilla, Opera and Google pulled the extensions in Dec 2019; Vice and PCMag published the leak in Jan 2020 and Avast shut Jumpshot days later. Avast has since merged into Gen Digital.",
    lesson: [
      "“Free” security software is still a business — check who pays for it.",
      "Audit your browser extensions; remove anything you don't actively use.",
      "“Aggregated and de-identified” is a claim, not a guarantee — click-streams re-identify.",
    ],
    sources: [
      "Anesh, “Avast and Jumpshot” case study (FTC 2024 order; Vice/PCMag Jan 2020 reporting)",
      "Know Your Data handbook — enforcement table (FTC 2024, USD 16.5M)",
    ],
    authors: "Anesh",
    ghost: "opened file 01 · reads security news → segment: antivirus-switcher · $0.09 CPM",
  },

  /* ───────────────────────── 02 · META / CAMBRIDGE ANALYTICA ───────────────────────── */
  {
    id: "meta-cambridge-analytica",
    file: "02",
    company: "Meta / Cambridge Analytica",
    years: "2014–2019",
    codename: "OPERATION FRIEND GRAPH",
    categories: ["tracking", "dark-pattern"],
    severity: 5,
    headline: "One quiz app, ~270,000 installs, up to 87 million profiles — because your friends' consent counted as yours.",
    scale: { value: 87_000_000, display: "87M", unit: "profiles harvested (Facebook's estimate)", note: "Public record (Facebook, April 2018)" },
    deception: {
      claim: "“You control who sees your information.”",
      detail: "Facebook's privacy settings told users they could restrict their data to friends. The FTC alleged its disclosures and settings undermined those very choices.",
    },
    reality: [
      "Facebook's Graph API v1.0 let any app read data about the friends of whoever installed it — people who never touched the app.",
      "Researcher Aleksandr Kogan's quiz “thisisyourdigitallife” used this to pull data on up to 87 million people.",
      "The dataset reached Cambridge Analytica for political profiling. Facebook learned in 2015 and did not tell users until journalists exposed it in March 2018.",
    ],
    exploit: [
      "2014: a personality-quiz app, “thisisyourdigitallife”, launches on Facebook Login; roughly 270,000 people install it.",
      "Graph API v1.0 friend permissions let the app request installers' friends' profile data, likes and more — without those friends' knowledge.",
      "The app fans out across the social graph: ~270K installs → up to 87M profiles.",
      "Data is handed to Cambridge Analytica / SCL and used to build psychographic profiles for political ad targeting.",
      "Facebook asks for deletion in 2015 but does not audit it or notify users; the story breaks in March 2018.",
    ],
    chain: {
      nodes: [
        { label: "Your friend", sub: "takes a quiz" },
        { label: "Graph API v1.0", sub: "friends' data unlocked" },
        { label: "Quiz app", sub: "harvests 87M profiles" },
        { label: "Cambridge Analytica", sub: "political targeting" },
      ],
      packets: ["oauth: user_friends", "likes · city · DOB", "psychographic score"],
    },
    gain: "Facebook earned roughly $56B in revenue and $22B in profit the year before the fine; it had already set aside $3B and its stock rose when the settlement leaked.",
    penalties: [
      { authority: "US FTC", year: "2019", amount: "$5B + 20-year order, board privacy committee", usd: 5_000_000_000, status: "settled", counted: true, note: "Largest FTC privacy penalty at the time; approved 3–2." },
      { authority: "US SEC", year: "2019", amount: "$100M (misleading investors about the misuse)", usd: 100_000_000, status: "settled", counted: true, note: "Public record." },
      { authority: "UK ICO", year: "2018", amount: "£500,000 (the legal maximum under the old UK law)", usd: 650_000, status: "final", counted: true, note: "Public record." },
      { authority: "Irish DPC", year: "2023", amount: "€1.2B (≈ $1.3B) — EU→US data transfers", usd: 1_300_000_000, status: "appealed", counted: true, note: "NOT a Cambridge Analytica fine: it punished transferring EU users' data to the US after Schrems II. Suspended pending Meta's appeal." },
    ],
    ledger: {
      title: "The $5B fine vs. Facebook's previous year",
      bars: [
        { label: "2018 revenue", value: 55.8, display: "≈ $56B", tone: "ink" },
        { label: "2018 profit", value: 22, display: "≈ $22B", tone: "amber" },
        { label: "FTC penalty", value: 5, display: "$5B", tone: "crimson" },
      ],
      note: "The fine was about 9% of 2018 revenue. Commissioner Slaughter noted the stock rise may mean the market thought the violation was still profitable.",
    },
    outcome: "Friend-data permissions were removed from the API (2014–15). Cambridge Analytica collapsed in 2018. Critics noted the FTC order did not restrict how Facebook collects data.",
    lesson: [
      "Your privacy depends on your friends' clicks — review which apps hold Facebook/Google Login access.",
      "Revoke old third-party app connections every few months.",
      "A record fine priced in advance is a business expense, not a deterrent.",
    ],
    sources: [
      "Divisha, “Big Tech Data Exploitation” (FTC $5B, stock rise, DPC €1.2B transfers)",
      "Saatvik Sanka, Divyam Thakur, Gauri Nanda Salu, “Economics of Personal Data” (9% of 2018 revenue, Table 1)",
      "Krishna Gaur, Meta Pixel dossier §5.2–5.3 (FTC order terms; DPC decision scope)",
      "Public record: thisisyourdigitallife, ~270K installs, 87M estimate, Graph API v1.0, SEC $100M, ICO £500K",
    ],
    authors: "Divisha · Saatvik, Divyam & Gauri · Krishna Gaur",
    ghost: "lingered on 'Cambridge Analytica' → political-interest score +0.4 · swing-voter?",
    caveat: "The brief cited the Irish fine as €1.3B. The DPC fine was €1.2B (≈ $1.3B), and it concerned EU→US transfers, not Cambridge Analytica.",
  },

  /* ───────────────────────── 03 · GOOGLE INCOGNITO ───────────────────────── */
  {
    id: "google-incognito",
    file: "03",
    company: "Google — Incognito mode",
    years: "2020–2024",
    codename: "OPERATION PRIVATE WINDOW",
    categories: ["tracking", "dark-pattern"],
    severity: 3,
    headline: "“Now you can browse privately.” Google's own trackers kept watching.",
    scale: { value: 0, display: "Billions", unit: "of private-browsing records to destroy", note: "Settlement terms, Brown v. Google (2024)" },
    deception: {
      claim: "“Now you can browse privately.”",
      detail: "Chrome's Incognito splash screen implied privacy. In reality it only stops your own device saving history.",
    },
    reality: [
      "Websites running Google Analytics, Ad Manager and other Google code kept sending your page visits and identifiers to Google during Incognito sessions.",
      "Plaintiffs alleged Google collected and used this private-browsing data; Google denied wrongdoing and settled without admitting liability.",
      "The class received no cash — but Google agreed to destroy or remediate billions of records and rewrite its disclosures.",
    ],
    exploit: [
      "User opens a Chrome Incognito window and sees “Now you can browse privately.”",
      "Incognito only clears local history and cookies at the end of the session.",
      "Every site embedding Google's analytics/ad code still fires requests to Google with page URL, IP and browser details.",
      "Google receives private-browsing activity alongside normal browsing data (alleged in Brown v. Google, N.D. Cal., filed June 2020).",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "opens Incognito" },
        { label: "Any website", sub: "embeds Google code" },
        { label: "Google Analytics / Ads", sub: "request still fires" },
        { label: "Google servers", sub: "logs the session" },
      ],
      packets: ["GET /page", "ga.js · IP · UA", "session log"],
    },
    gain: "Plaintiffs sought at least $5B in damages. The value of private-browsing signals to Google's ad business was not quantified in the record we reviewed.",
    penalties: [
      { authority: "Brown v. Google settlement (N.D. Cal.)", year: "2024", amount: "$0 cash to class · destroy billions of records · new Incognito disclosures · block third-party cookies in Incognito for 5 years", usd: 0, status: "settled", counted: true, note: "Individuals kept the right to sue for damages separately. Public record." },
    ],
    ledger: {
      title: "Damages sought vs. cash paid",
      bars: [
        { label: "Damages sought by plaintiffs", value: 5000, display: "$5B", tone: "ink" },
        { label: "Cash paid to the class", value: 0, display: "$0", tone: "crimson" },
      ],
      note: "The remedy was behavioural (deletion + disclosure), which can matter more than cash — but nobody was compensated.",
    },
    outcome: "Settlement filed April 2024: Google must delete or remediate the collected private-browsing data, change Incognito's wording and default-block third-party cookies in Incognito for five years.",
    lesson: [
      "Incognito ≠ invisible. Sites, your ISP and Google still see you.",
      "Use a tracker-blocking browser or uBlock Origin — they stop the requests at source.",
      "Log out of Google accounts in sessions you want separated.",
    ],
    sources: [
      "Lakshan Muruganandam, Know Your Data handbook §2.10 “Myths to drop” (Incognito)",
      "Public record: Brown v. Google LLC, N.D. Cal. No. 4:20-cv-03664 — settlement filed 1 April 2024",
    ],
    authors: "Lakshan Muruganandam (myth framing) · case facts from public court record",
    ghost: "opened 'Incognito' file → believes private mode works? · retarget eligible",
    caveat: "The student texts only cover the Incognito myth; the litigation details are from the public record and should be re-checked before publication.",
  },

  /* ───────────────────────── 04 · NATIONAL PUBLIC DATA ───────────────────────── */
  {
    id: "national-public-data",
    file: "04",
    company: "National Public Data",
    years: "2023–2024",
    codename: "OPERATION BACKGROUND CHECK",
    categories: ["broker", "breach"],
    severity: 5,
    headline: "A background-check broker you never signed up for lost 2.9 billion rows of SSNs — then went bankrupt.",
    scale: { value: 2_900_000_000, display: "2.9B", unit: "rows offered for sale (not people)", note: "Seller's claim; 272M–899M unique SSNs" },
    deception: {
      claim: "“1.3 million people affected.”",
      detail: "That is what NPD told Maine's Attorney General. You never had a relationship with NPD — brokers compile you from public records without asking.",
    },
    reality: [
      "Researchers counted between 272 million and ~899 million unique Social Security numbers in the leak.",
      "NPD's own bankruptcy filing conceded that “hundreds of millions” of people may be affected.",
      "It held 30 years of address history and ~2 million records for people who would be over 120.",
    ],
    exploit: [
      "NPD (Jerico Pictures, Florida) aggregates names, addresses, phones and SSNs from public records for background checks.",
      "Late Dec 2023: intruders take the database. How they got in is still unconfirmed.",
      "Apr 2024: seller “USDoD” lists 2.9B rows for $3.5M.",
      "Jul–Aug 2024: 4 TB dumped on Breachforums; on 6 Aug “Fenice” posts ~2.7B rows for free.",
      "A sister site (Records Check) had published plaintext back-end passwords — weak hygiene, though not proven to be the entry route.",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "never signed up" },
        { label: "Public records", sub: "scraped & merged" },
        { label: "NPD database", sub: "SSN + 30y addresses" },
        { label: "Breach forums", sub: "2.9B rows, $3.5M" },
      ],
      packets: ["court · voter · DMV", "ssn · dob · addr[]", "dump.tar 277 GB"],
    },
    gain: "NPD reported 2023 revenue of $1.15M. Its stolen database was listed for $3.5M.",
    penalties: [
      { authority: "Chapter 11 (Jerico Pictures)", year: "2024", amount: "Filed 2 Oct 2024 · dismissed 31 Oct · shut down Dec 2024", usd: 0, status: "none", counted: false, note: "~20 class actions; no settlement or claim form as of July 2026." },
    ],
    ledger: {
      title: "What the data was worth vs. what's left for victims",
      bars: [
        { label: "Dark-web asking price", value: 3_500_000, display: "$3.5M", tone: "crimson" },
        { label: "NPD 2023 revenue", value: 1_150_000, display: "$1.15M", tone: "amber" },
        { label: "Assets left (bank + equipment)", value: 44_600, display: "≈ $44,600", tone: "ink" },
      ],
      note: "Liabilities to hundreds of millions of people vs. ≈ $44.6K of assets, and an insurer that declined coverage. The cost fell on victims.",
    },
    outcome: "Bankrupt, dismissed and shut down. In Aug 2025 the domain reappeared under a new owner claiming “zero affiliation”. Fake “settlement” sites have appeared — there is no settlement.",
    lesson: [
      "Freeze your credit at Equifax, Experian and TransUnion — it's free.",
      "Use data-broker opt-outs: people who had opted out were reportedly absent from the NPD data.",
      "Treat any message quoting your real address or SSN as phishing.",
    ],
    sources: [
      "Divya Nukala, “Mega Data Exposures” case study (Troy Hunt, Krebs, The Record, Malwarebytes)",
    ],
    authors: "Divya Nukala",
    ghost: "dwell>3s on 'SSN' → segment: identity-theft-anxious · upsell credit-lock $0.21",
    caveat: "2.9 billion is a row count, not people. Unique-SSN estimates range from 272M (Atlas, via Krebs) to ~899M (Hunt extrapolation).",
  },

  /* ───────────────────────── 05 · CHINA 4B LEAK ───────────────────────── */
  {
    id: "china-4b-leak",
    file: "05",
    company: "Unattributed Chinese database",
    years: "2025",
    codename: "OPERATION OPEN BUCKET",
    categories: ["breach", "broker"],
    severity: 4,
    headline: "631 GB, ~4 billion records, no password, no known owner — and no one to notify.",
    scale: { value: 4_000_000_000, display: "~4B", unit: "records in a 631 GB open database", note: "Cybernews, 5 June 2025" },
    deception: {
      claim: "“Chinese surveillance network.”",
      detail: "That is the viral label. It is one hypothesis (Cybernews). SpyCloud's analysis points to a criminal compilation of stolen data instead.",
    },
    reality: [
      "16 collections: WeChat IDs, home addresses, bank cards with birth dates and phones, Alipay tokens, vehicle, pension and insurance data.",
      "SpyCloud found misspelled field labels and gender values in the ID-card field — signs of sloppy merging, likely a criminal “SGK” lookup library.",
      "The server was closed within a day; the owner was never identified, so nobody could be held responsible.",
    ],
    exploit: [
      "Breached and stolen datasets are merged into one large store (likely an SGK social-engineering library).",
      "The store is exposed to the internet with no authentication at all.",
      "19 May 2025: Bob Dyachenko (SecurityDiscovery) and Cybernews find it; 16 collections visible.",
      "20 May: it goes offline before the owner can be traced.",
      "Linked bank + address + ID data lets an attacker map where someone lives and what they spend, owe and save.",
    ],
    chain: {
      nodes: [
        { label: "Earlier breaches", sub: "WeChat · bank · Alipay" },
        { label: "Aggregator", sub: "merges into 16 collections" },
        { label: "Open server", sub: "631 GB, no password" },
        { label: "Anyone", sub: "phishing · fraud · doxxing" },
      ],
      packets: ["wechat_id · phone", "addr · card · dob", "GET /collections"],
    },
    gain: "No price or owner is known. The value is the linkage: one lookup joins identity, address and finances.",
    penalties: [
      { authority: "No owner identified", year: "2025", amount: "No enforcement tied to this database (as of Oct 2026)", usd: 0, status: "none", counted: false, note: "China's PIPL (2021) and amended Cybersecurity Law (2026) apply, but no action has been linked to it." },
    ],
    ledger: {
      title: "“Records” are not people",
      bars: [
        { label: "Records claimed", value: 4_000, display: "~4.0B", tone: "crimson" },
        { label: "Raw records SpyCloud analysed", value: 1_800, display: "1.8B", tone: "amber" },
        { label: "Unique records after de-dup", value: 1_700, display: "1.7B", tone: "ink" },
      ],
      note: "SpyCloud's 1.7B unique records held 10.9B “data assets”. Headline counts measure rows, not individuals.",
    },
    outcome: "Taken offline 20 May 2025; Cybernews published 5 June, SpyCloud 18 June. No owner, no notification, no remedy.",
    lesson: [
      "Unchangeable identifiers (national ID, address, SSN) outlive any leak — minimise where you give them.",
      "Distrust messages that quote your real details.",
      "Organisations: require auth on every datastore and scan for exposed instances.",
    ],
    sources: [
      "Divya Nukala, “Mega Data Exposures” case study (Cybernews 5 Jun 2025; SpyCloud 18 Jun 2025; Security Affairs)",
    ],
    authors: "Divya Nukala",
    ghost: "opened unattributed leak → interest: OSINT · geo-politics segment",
    caveat: "Merged with NPD in the brief as one case; split into two files here because the mechanics differ (broker breach vs. unattributed open database).",
  },

  /* ───────────────────────── 06 · CLEARVIEW AI ───────────────────────── */
  {
    id: "clearview-ai",
    file: "06",
    company: "Clearview AI",
    years: "2017–2024",
    codename: "OPERATION FACE SCRAPE",
    categories: ["biometric", "broker"],
    severity: 5,
    headline: "Every public photo of you, turned into a searchable faceprint — without asking.",
    scale: { value: 30_000_000_000, display: "30B+", unit: "scraped face images", note: "Clearview's own 2023 claim (public record)" },
    deception: {
      claim: "“We only use publicly available images.”",
      detail: "Clearview argues public photos are fair game. European regulators held that public ≠ consent to biometric processing.",
    },
    reality: [
      "Billions of photos scraped from social media and news sites were converted into biometric faceprints without consent.",
      "Upload one photo and the system returns matching faces and the links where they appear online.",
      "Five European regulators fined it; Clearview disputes that EU and UK law apply to it at all.",
    ],
    exploit: [
      "Crawlers scrape publicly posted photos from social platforms, news and other sites.",
      "Each face is converted into a mathematical faceprint and indexed with its source URL.",
      "A client uploads a probe photo; the engine returns visually similar faces and where they were found.",
      "Access is sold mainly to law enforcement — the people in the database were never asked.",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "posts a photo" },
        { label: "Scraper", sub: "copies the image" },
        { label: "Faceprint index", sub: "30B+ vectors" },
        { label: "Clients", sub: "upload → identify" },
      ],
      packets: ["img.jpg · src_url", "vec[512]", "match: 0.97 → you"],
    },
    gain: "Clearview's revenue is private; the asset is a biometric index no individual consented to.",
    penalties: [
      { authority: "Dutch AP (Netherlands)", year: "2024", amount: "€30.5M (≈ $33M)", usd: 33_000_000, status: "final", counted: true },
      { authority: "CNIL (France)", year: "2022", amount: "€20M (+ €5.2M overdue penalty, 2023)", usd: 21_600_000, status: "final", counted: true, note: "Public record." },
      { authority: "Garante (Italy)", year: "2022", amount: "€20M", usd: 21_600_000, status: "final", counted: true, note: "Public record." },
      { authority: "Hellenic DPA (Greece)", year: "2022", amount: "€20M", usd: 21_600_000, status: "final", counted: true, note: "Public record." },
      { authority: "UK ICO", year: "2022", amount: "£7.55M", usd: 9_500_000, status: "overturned", counted: false, note: "Overturned by the First-tier Tribunal in Oct 2023 on jurisdiction (Clearview served only foreign law enforcement). The ICO appealed; not counted in totals." },
    ],
    ledger: {
      title: "European fines (EUR)",
      bars: [
        { label: "Netherlands", value: 30.5, display: "€30.5M", tone: "crimson" },
        { label: "France", value: 20, display: "€20M", tone: "crimson" },
        { label: "Italy", value: 20, display: "€20M", tone: "crimson" },
        { label: "Greece", value: 20, display: "€20M", tone: "crimson" },
        { label: "UK (overturned)", value: 8.7, display: "£7.55M ✕", tone: "ink" },
      ],
      note: "≈ €90.5M levied across the EU. Clearview contests EU jurisdiction; whether these fines are actually collected is uncertain.",
    },
    outcome: "Orders to stop processing and delete EU residents' data. The company kept operating, largely outside Europe.",
    lesson: [
      "Lock down who can see your photos; untag yourself where possible.",
      "In the EU/UK, use GDPR access and erasure rights against biometric databases.",
      "A face is a password you can't change — treat it like one.",
    ],
    sources: [
      "Saatvik Sanka, Divyam Thakur, Gauri Nanda Salu, “Economics of Personal Data” §3.3 (Dutch €30.5M, 2024)",
      "Public record: ICO May 2022 + First-tier Tribunal Oct 2023; CNIL Oct 2022 / May 2023; Garante 2022; Hellenic DPA 2022",
    ],
    authors: "Saatvik, Divyam & Gauri · other fines from public record",
    ghost: "viewed 'Clearview' → face-privacy concern · likely blurs photos · CPM −$0.04",
    caveat: "The UK ICO's £7.5M fine was overturned on appeal in Oct 2023 (jurisdiction), so it's shown but excluded from totals. Only the Dutch fine appears in the student sources; the rest are from the public record.",
  },

  /* ───────────────────────── 07 · THE BIGGEST LIE ───────────────────────── */
  {
    id: "biggest-lie",
    file: "07",
    company: "Terms & cookie banners (industry-wide)",
    years: "2016–2025",
    codename: "OPERATION I AGREE",
    categories: ["dark-pattern"],
    severity: 3,
    headline: "98% of people agreed to give away their first-born child. That is how consent works online.",
    scale: { value: 0, display: "98%", unit: "missed the first-born-child clause", note: "Obar & Oeldorf-Hirsch, “The Biggest Lie on the Internet”" },
    deception: {
      claim: "“By clicking ‘I agree’ you have read and accepted…”",
      detail: "A click is treated as informed consent — however long, vague or buried the document. The burden of understanding falls on you.",
    },
    reality: [
      "In a fake social network experiment (“The Biggest Lie on the Internet”), about 98% of participants agreed to terms that included surrendering their first-born child.",
      "A 2017 Deloitte survey found 91% of consumers accept terms without reading them.",
      "Of 2,957 cookie banners, 2,656 offered “Accept all” — only 349 offered “Reject all”. Just 21 of 330 showed both equally.",
    ],
    exploit: [
      "Bury the data-sharing terms in a long, vague document — nobody reads it, and the company knows.",
      "Make “Accept all” a single bright button.",
      "Hide “Reject” behind a second layer (“Manage options”) or make it small and grey.",
      "Count every click — however steered — as legal consent.",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "wants the content" },
        { label: "Cookie banner", sub: "Accept = 1 click" },
        { label: "Consent record", sub: "“user agreed”" },
        { label: "Ad partners", sub: "hundreds of vendors" },
      ],
      packets: ["click: accept_all", "tcf_string=CP…", "bid_request"],
    },
    gain: "Carnegie Mellon research found people accept more cookies when “Accept all” is the easiest click — design converts directly into data.",
    penalties: [
      { authority: "CNIL (France) — Google cookie consent", year: "2020", amount: "€100M", usd: 118_000_000, status: "final", counted: true },
      { authority: "CNIL (France) — Google cookie consent", year: "2021", amount: "€150M", usd: 170_000_000, status: "final", counted: true },
      { authority: "CNIL (France) — Google cookie consent", year: "2025", amount: "€325M", usd: 350_000_000, status: "final", counted: true, note: "Three fines in five years: repeat offending." },
      { authority: "US FTC — Epic Games (dark patterns portion)", year: "2022", amount: "$245M", usd: 245_000_000, status: "settled", counted: true },
    ],
    ledger: {
      title: "Cookie banners: accept vs. reject (2,957 banners)",
      bars: [
        { label: "Offered “Accept all”", value: 2656, display: "2,656", tone: "crimson" },
        { label: "Offered “Reject all”", value: 349, display: "349", tone: "lime" },
        { label: "Showed both equally (of 330)", value: 21, display: "21", tone: "amber" },
      ],
      note: "From an analysis of 4,532 scraped websites (AI-Laws), as summarised by Divisha.",
    },
    outcome: "Regulators now fine banner design itself (CNIL vs Google ×3, FTC vs Epic). The consent model still rests on a clicked button.",
    lesson: [
      "Always look for “Reject all” or “Manage” — and use uBlock's cookie-notice filters.",
      "Search long terms for “share”, “partners”, “train”, “retain” instead of reading every line.",
      "Tools like ToS;DR grade terms for you.",
    ],
    sources: [
      "Divisha, “Big Tech Data Exploitation” §1 (98%, Deloitte 91%, 4,532/2,957/2,656/349/21-of-330, CMU finding)",
      "Saatvik, Divyam & Gauri §4.5 (CNIL Google €100M/€150M/€325M)",
      "Know Your Data handbook (Epic Games $245M dark-pattern portion)",
      "Public record: Obar & Oeldorf-Hirsch study (543 participants, fictitious network “NameDrop”)",
    ],
    authors: "Divisha · Saatvik, Divyam & Gauri · Lakshan Muruganandam",
    ghost: "scrolled past consent stats · banner-fatigue score 0.82 · nudge harder",
    caveat: "The 2,656 / 349 cookie-banner numbers come from an AI-Laws analysis of 4,532 sites, not Carnegie Mellon. CMU's separate finding is the behavioural one (equal options → fewer accepts).",
  },

  /* ───────────────────────── 08 · EQUIFAX ───────────────────────── */
  {
    id: "equifax",
    file: "08",
    company: "Equifax",
    years: "2017–2019",
    codename: "OPERATION UNPATCHED",
    categories: ["breach", "broker"],
    severity: 5,
    headline: "A credit bureau you never chose left a known hole open for two months — and lost 147 million people.",
    scale: { value: 147_000_000, display: "~147M", unit: "people's SSNs, birth dates, addresses", note: "Public record (FTC 2019)" },
    deception: {
      claim: "“A trusted steward of consumer credit data.”",
      detail: "You can't opt out of a credit bureau. Its whole business is holding your most sensitive identifiers.",
    },
    reality: [
      "A patch for the Apache Struts flaw (CVE-2017-5638) was available on 7 March 2017; Equifax's dispute portal stayed unpatched.",
      "Attackers were inside from mid-May and pulled data for about 11 weeks before anyone noticed on 29 July.",
      "An expired certificate on a traffic-inspection device meant the exfiltration went unseen.",
    ],
    exploit: [
      "Mar 2017: Apache discloses and patches CVE-2017-5638 in Struts.",
      "Equifax's online dispute portal remains unpatched.",
      "Mid-May: attackers exploit it, find stored credentials and query dozens of databases.",
      "An expired SSL certificate blinds the monitoring tool; traffic leaves unnoticed.",
      "29 Jul: breach detected · 7 Sep 2017: public disclosure.",
    ],
    chain: {
      nodes: [
        { label: "You", sub: "never a customer" },
        { label: "Dispute portal", sub: "unpatched Struts" },
        { label: "Credit databases", sub: "SSN · DOB · address" },
        { label: "Attackers", sub: "11 weeks unseen" },
      ],
      packets: ["Content-Type: %{…}", "SELECT ssn, dob…", "exfil.tgz"],
    },
    gain: "Equifax's 2017 revenue was ≈ $3.36B — built on data about people who never signed up.",
    penalties: [
      { authority: "FTC + CFPB + US states", year: "2019", amount: "Up to $700M (incl. up to $425M consumer fund)", usd: 700_000_000, status: "settled", counted: true, note: "Public record." },
      { authority: "UK ICO", year: "2018", amount: "£500,000", usd: 650_000, status: "final", counted: true, note: "Public record." },
    ],
    ledger: {
      title: "Settlement vs. a year of revenue",
      bars: [
        { label: "2017 revenue", value: 3_362, display: "≈ $3.36B", tone: "ink" },
        { label: "Max settlement", value: 700, display: "$700M", tone: "crimson" },
        { label: "Consumer fund", value: 425, display: "$425M", tone: "amber" },
      ],
      note: "$425M ÷ 147M people ≈ $2.89 each — less than a coffee for a lifetime SSN exposure.",
    },
    outcome: "Settled in July 2019. Credit freezes became free by US law in 2018 — the defence that actually works.",
    lesson: [
      "Freeze your credit at all three bureaus — free, and it blocks new accounts in your name.",
      "Check your credit reports weekly (free since 2023).",
      "Prefer a freeze to a paid “credit lock” sold by the same bureaus.",
    ],
    sources: [
      "Public record: FTC/CFPB Equifax settlement (July 2019); US GAO-18-559",
      "Credit-freeze advice: Divya Nukala (via Krebs) and Sumayya's defence guide",
    ],
    authors: "Public record · defence advice by Divya Nukala & Sumayya",
    ghost: "opened 'Equifax' → segment: credit-anxious · +$0.12 CPM",
    caveat: "Equifax is not a case study in the student texts (they only mention freezing your credit there). Facts here are from the public record.",
  },

  /* ───────────────────────── 09 · META PIXEL HEALTH ───────────────────────── */
  {
    id: "meta-pixel-health",
    file: "09",
    company: "Meta Pixel on hospital sites",
    years: "2022–present",
    codename: "OPERATION PIXEL HUNT",
    categories: ["tracking"],
    severity: 4,
    headline: "Click “Book appointment” — and an ad platform may learn your doctor, your condition and your prescription.",
    scale: { value: 0, display: "33 / 100", unit: "top US hospitals sent booking clicks to Facebook", note: "The Markup, 16 June 2022" },
    deception: {
      claim: "“Your health information is confidential.”",
      detail: "Patients trust the hospital. But third-party ad code on the hospital's own pages can open a separate data flow to Meta.",
    },
    reality: [
      "33 of Newsweek's top 100 US hospitals sent Meta Pixel data when users clicked appointment buttons.",
      "In patient portals, the pixel transmitted medication names and dosages, allergic reactions and a sexual-orientation answer.",
      "Meta says filters strip sensitive health data — but the investigation could not confirm they worked, and a NY regulator found them not fully accurate.",
    ],
    exploit: [
      "Hospital adds Meta Pixel (a JavaScript snippet) to measure ad campaigns.",
      "Patient searches “pregnancy termination” or picks “Alzheimer's” from a menu and clicks Book.",
      "The pixel builds a request: event name, page URL, button text, IP and — sometimes — form fields.",
      "Some contact fields are hashed, but Meta uses hashes to match people to profiles.",
      "The request leaves the browser for Meta; downstream use is invisible to the patient.",
    ],
    chain: {
      nodes: [
        { label: "Patient", sub: "books appointment" },
        { label: "Hospital site", sub: "Meta Pixel embedded" },
        { label: "Meta", sub: "receives event" },
        { label: "Ad systems", sub: "use unproven" },
      ],
      packets: ["click: Book", "dr_name · 'alzheimer's'", "hashed email"],
    },
    gain: "Meta's 2024 advertising revenue was $160.6B (≈ 97% of revenue). No revenue can be attributed to these specific health signals.",
    penalties: [
      { authority: "Pixel Hunt investigation", year: "2022", amount: "No penalty — 28 of 33 hospitals removed or blocked the pixel", usd: 0, status: "none", counted: false, note: "Novant Health mailed breach notices to 1.3M people." },
      { authority: "Mass General Brigham (tracking suit)", year: "2022", amount: "$18.4M settlement — hospital, not Meta", usd: 18_400_000, status: "settled", counted: true, note: "Denied wrongdoing; admitted no liability." },
      { authority: "In re Meta Pixel Healthcare Litigation", year: "2022–", amount: "Ongoing", usd: 0, status: "pending", counted: false },
    ],
    ledger: {
      title: "Ad business vs. penalties from this investigation",
      bars: [
        { label: "Meta 2024 ad revenue", value: 160_600, display: "$160.6B", tone: "ink" },
        { label: "Related hospital settlement (MGB)", value: 18.4, display: "$18.4M", tone: "amber" },
        { label: "Penalty on Meta from Pixel Hunt", value: 0, display: "$0", tone: "crimson" },
      ],
      note: "Krishna's deterrence model: a $100M fine with 10% detection × 50% enforcement = $5M expected cost.",
    },
    outcome: "Rapid removals after reporting; HHS guidance on trackers partly vacated by a federal court in June 2024. The legal picture remains fact-specific.",
    lesson: [
      "Use a tracker-blocking browser for health, legal and financial sites.",
      "Hashed ≠ anonymous: hashes are matching keys.",
      "Ask providers which third parties receive data from their booking pages.",
    ],
    sources: [
      "Krishna Gaur, “The Meta Pixel, Healthcare Data, and the Economics of Surveillance” (The Markup 2022; Meta 10-K; HHS OCR)",
    ],
    authors: "Krishna Gaur",
    ghost: "health-adjacent dwell → segment: health-conscious · HIPAA-adjacent · $$$",
    caveat: "Not proof that Meta monetised the specific data or that HIPAA was violated — the investigation documented transmissions, not downstream use.",
  },

  /* ───────────────────────── 10 · FLO HEALTH ───────────────────────── */
  {
    id: "flo-health",
    file: "10",
    company: "Flo Health × Meta",
    years: "2016–2025",
    codename: "OPERATION CYCLE",
    categories: ["tracking"],
    severity: 4,
    headline: "A period tracker's embedded analytics sent menstrual and pregnancy data to third parties. A jury called it eavesdropping.",
    scale: { value: 0, display: "$5,000", unit: "per violation under California's CIPA", note: "Frasco v. Flo Health" },
    deception: {
      claim: "“Your cycle data stays private.”",
      detail: "Users logged periods and pregnancy intentions in a health app — not knowing embedded SDKs relayed events to third parties.",
    },
    reality: [
      "Analytics code embedded in the app sent users' menstrual and pregnancy events to third parties, including Meta.",
      "Flo, Google and Flurry settled before trial; Meta went to trial.",
      "On 1 August 2025 a jury found Meta liable under CIPA for intentionally eavesdropping without consent.",
    ],
    exploit: [
      "Flo embeds third-party analytics/advertising SDKs in its app.",
      "User logs a period or marks “trying to get pregnant”.",
      "The SDK fires a custom event describing that action to the SDK's owner.",
      "The third party receives intimate health signals tied to device identifiers.",
    ],
    chain: {
      nodes: [
        { label: "User", sub: "logs cycle" },
        { label: "Flo app", sub: "SDKs embedded" },
        { label: "Analytics SDK", sub: "custom event" },
        { label: "Meta & others", sub: "receive signal" },
      ],
      packets: ["event: PREGNANCY", "adid · ts", "app_event"],
    },
    gain: "Not quantified in the sources. Meta has described its CIPA exposure as potentially multiple billions.",
    penalties: [
      { authority: "Jury verdict — Frasco v. Flo Health (N.D. Cal.)", year: "2025", amount: "Meta liable under CIPA · damages not yet set (Sept 2026)", usd: 0, status: "pending", counted: false, note: "Court rejected Meta's post-trial challenges." },
    ],
    ledger: {
      title: "Why statutory damages scare companies",
      bars: [
        { label: "Per violation (CIPA)", value: 5_000, display: "$5,000", tone: "crimson" },
      ],
      note: "Class actions with statutory damages scale with the number of victims — no proof of financial loss needed.",
    },
    outcome: "A rare trial verdict on tracking-as-eavesdropping. Damages pending as of September 2026.",
    lesson: [
      "Treat health apps as data exporters — check their privacy labels and SDK lists (Exodus Privacy).",
      "Prefer apps that store cycle data locally.",
      "Deny ad-tracking permission on your phone.",
    ],
    sources: [
      "Divisha, “Big Tech Data Exploitation” §2A (Bloomberg Government, 16 Sep 2026)",
    ],
    authors: "Divisha",
    ghost: "fem-health dwell → segment: reproductive-health · sensitive (sold anyway?)",
  },
];

/* ── vault-wide aggregates ── */
export const totals = {
  files: cases.length,
  records: cases.reduce((s, c) => s + c.scale.value, 0),
  finesUsd: cases.reduce((s, c) => s + c.penalties.filter((p) => p.counted).reduce((a, p) => a + p.usd, 0), 0),
  contested: cases.reduce((s, c) => s + c.penalties.filter((p) => p.status === "appealed" || p.status === "overturned" || p.status === "pending").length, 0),
};
