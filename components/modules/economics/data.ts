/**
 * Numbers for Module 03 — "The Economics of Exploitation".
 * Primary source: Saatvik Sanka, Divyam Thakur & Gauri Nanda Salu,
 * "Economics of Personal Data" (Millennium Fellowship, 8 Oct 2026).
 * Bracketed numbers [n] refer to that paper's own source list.
 */

export const AUTHORS = "Saatvik Sanka, Divyam Thakur & Gauri Nanda Salu";
export const PAPER = `${AUTHORS}, “Economics of Personal Data”, Millennium Fellowship 2026`;

/** Meta FY2025, USD millions [25] */
export const META_REVENUE_2025 = 200_970;
export const META_NET_INCOME_2025 = 60_460;
export const META_AD_REVENUE_2025 = 196_200;

export type Fine = {
  id: string;
  label: string;
  short: string;
  year: string;
  amount: number; // USD millions
  note: string;
  ghost: string;
};

/** Table 1 of the paper (amounts from [7]). Percentages are recomputed live, not hard-coded. */
export const META_FINES: Fine[] = [
  {
    id: "ftc",
    label: "FTC / Cambridge Analytica",
    short: "FTC 2019",
    year: "2019",
    amount: 5_000,
    note: "Settlement. ≈9% of 2018 revenue at the time; Meta had pre-booked a $3B charge.",
    ghost: "fine anticipated → $3B provisioned → stock hit 1-yr high on the leak",
  },
  {
    id: "texas",
    label: "Texas biometric settlement",
    short: "Texas 2024",
    year: "2024",
    amount: 1_400,
    note: "Unauthorised capture of facial-geometry data (settlement).",
    ghost: "face template harvested · settled · face templates already trained on",
  },
  {
    id: "dpc23",
    label: "Irish DPC, EU–US transfers",
    short: "Irish DPC 2023",
    year: "2023",
    amount: 1_300,
    note: "EUR 1.2B — largest GDPR fine ever. Suspended pending appeal.",
    ghost: "eur 1.2B · status: suspended pending appeal · cash out: $0 (so far)",
  },
  {
    id: "spain",
    label: "Spanish court, publishers’ suit (private)",
    short: "Spain 2025",
    year: "2025",
    amount: 540,
    note: "Private court judgment, not a regulator fine.",
    ghost: "private judgment · line item: litigation reserve",
  },
  {
    id: "dpc5",
    label: "Irish DPC fines (five, EUR 91M–405M)",
    short: "5× DPC 22–24",
    year: "2022–24",
    amount: 1_438,
    note: "Five separate Irish DPC decisions combined.",
    ghost: "five fines · five press cycles · zero structural changes required",
  },
];

export const META_FINES_TOTAL = META_FINES.reduce((a, f) => a + f.amount, 0); // 9,678

export const pct = (part: number, whole: number) => (part / whole) * 100;
export const daysOf = (amount: number, annual: number) => amount / (annual / 365);

/* ───────── Expected-cost simulator ───────── */

export type SimState = {
  pDetect: number; // 0..1
  pEnforce: number; // 0..1
  logFine: number; // log10($M)
  r: number; // 0..0.3
  t: number; // years
  logRev: number; // log10($M per year)
};

export type Preset = {
  id: string;
  label: string;
  state: SimState;
  /** which inputs come from the source vs. are our assumptions */
  note: string;
};

const L = Math.log10;

export const PRESETS: Preset[] = [
  {
    id: "meta2019",
    label: "Meta 2019",
    state: { pDetect: 1, pEnforce: 1, logFine: L(5_000), r: 0.08, t: 1, logRev: L(22_000) },
    note: "Fine $5B and ~$22B prior-year profit are from the paper [19, 21]. Detection set to 100% — it actually happened — and it is still rational. r and t are our assumptions.",
  },
  {
    id: "dpc",
    label: "Irish DPC 2023",
    state: { pDetect: 0.6, pEnforce: 0.5, logFine: L(1_300), r: 0.08, t: 8, logRev: L(5_000) },
    note: "Fine $1.3B from Table 1; 50% enforcement because it was suspended pending appeal [14]. Years, detection and the $5B/yr tracking revenue are illustrative.",
  },
  {
    id: "gdprmax",
    label: "GDPR max (4% turnover)",
    state: { pDetect: 0.5, pEnforce: 0.6, logFine: L(0.04 * META_REVENUE_2025), r: 0.08, t: 5, logRev: L(10_000) },
    note: "Fine = 4% of Meta’s 2025 revenue ($200.97B) ≈ $8.0B — the GDPR ceiling [14]. Investigations take years and appeals cut payment; probabilities and $10B/yr are assumptions.",
  },
  {
    id: "startup",
    label: "Small startup",
    state: { pDetect: 0.05, pEnforce: 0.5, logFine: L(20), r: 0.12, t: 3, logRev: L(5) },
    note: "A small app selling location data for $5M/yr against a €20M-tier fine with a 5% chance of anyone noticing. All values illustrative.",
  },
  {
    id: "aiact",
    label: "AI Act max (7%)",
    state: { pDetect: 0.85, pEnforce: 0.9, logFine: L(0.07 * META_REVENUE_2025), r: 0.08, t: 1, logRev: L(10_000) },
    note: "The EU AI Act allows up to 7% of global turnover [14]. Fast, likely, turnover-scaled enforcement is what flips the verdict. Probabilities are assumptions.",
  },
];

export const DEFAULT_STATE: SimState = PRESETS[0].state;

export function discount(r: number, t: number) {
  return 1 / Math.pow(1 + r, t);
}

/** present value of a stream of R per year for t years (continuous-ish annuity, end-of-year) */
export function pvGain(R: number, r: number, t: number) {
  if (t <= 0) return 0;
  if (r < 1e-6) return R * t;
  return (R * (1 - Math.pow(1 + r, -t))) / r;
}

export function expectedPenalty(s: { pDetect: number; pEnforce: number; fine: number; r: number; t: number }) {
  return s.pDetect * s.pEnforce * s.fine * discount(s.r, s.t);
}

/* ───────── formatting ───────── */

export function money(m: number, digits = 1): string {
  // input in USD millions
  const abs = Math.abs(m);
  const sign = m < 0 ? "−" : "";
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : digits)}B`;
  if (abs >= 1) return `${sign}$${abs.toFixed(abs >= 100 ? 0 : digits)}M`;
  if (abs >= 0.001) return `${sign}$${(abs * 1_000).toFixed(0)}K`;
  return `${sign}$${Math.round(abs * 1_000_000)}`;
}

export function pctFmt(v: number, digits = 1) {
  if (!isFinite(v)) return "∞%";
  if (Math.abs(v) >= 100_000) return `${v > 0 ? ">" : "<−"}100,000%`;
  return `${v.toLocaleString("en-US", { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : digits })}%`;
}
