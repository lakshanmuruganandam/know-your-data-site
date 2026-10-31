/**
 * "The 200 milliseconds after you click" — script, timings and data helpers.
 *
 * Every number here is reused from elsewhere on the site:
 *  - ~100 ms RTB auction (app/economics, RtbAuction.tsx)
 *  - National Public Data: 2.9B rows, $3.5M ask, ~2.7B posted free,
 *    272M–899M unique SSNs (lib/data/cases.ts)
 *  - BASE_CPM + per-field CPM uplift (lib/shadow.tsx)
 * The timecode is a dramatisation: an illustrative timeline, not a measurement.
 */

import type { ShadowField } from "@/lib/shadow";

export type Tone = "cyan" | "amber" | "crimson" | "lime";

export type Chapter = {
  id: "click" | "pixel" | "auction" | "broker" | "breach" | "shield";
  n: string;
  a: number;
  b: number;
  title: string;
  accent: string;
  tone: Tone;
  status: string;
  caption: string;
  ghost: string;
};

/** scroll-progress window of the prologue title card */
export const PROLOGUE: [number, number] = [0, 0.07];

export const CHAPTERS: Chapter[] = [
  {
    id: "click",
    n: "01",
    a: 0.07,
    b: 0.22,
    title: "The",
    accent: "click.",
    tone: "cyan",
    status: "live · page not yet painted",
    caption: "You tap a link. Before the page paints, scripts are already reading your browser. No prompt. No permission.",
    ghost: "click captured · element, x/y, timestamp → session replay",
  },
  {
    id: "pixel",
    n: "02",
    a: 0.22,
    b: 0.37,
    title: "The",
    accent: "pixel.",
    tone: "cyan",
    status: "live · request in flight",
    caption: "An invisible 1×1 image fires. The image is nothing. Its URL is the message, and every parameter is a piece of you.",
    ghost: "pixel fired · 1×1 · your dossier rode along in the query string",
  },
  {
    id: "auction",
    n: "03",
    a: 0.37,
    b: 0.54,
    title: "The",
    accent: "auction.",
    tone: "amber",
    status: "live · bids closing",
    caption: "Your profile is broadcast to bidders. The highest wins in about 100 ms, and every loser keeps a copy.",
    ghost: "bid request broadcast · losers retain the profile",
  },
  {
    id: "broker",
    n: "04",
    a: 0.54,
    b: 0.69,
    title: "The",
    accent: "broker.",
    tone: "amber",
    status: "stored · indefinitely",
    caption: "Copies drift to data brokers you never met, stitched into records next to everyone else's.",
    ghost: "record appended · joined on device hash · resold as a segment",
  },
  {
    id: "breach",
    n: "05",
    a: 0.69,
    b: 0.84,
    title: "The",
    accent: "breach.",
    tone: "crimson",
    status: "t + years · exfiltrated",
    caption: "National Public Data, a background-check broker, lost 2.9B rows of names, SSNs and addresses. Then it went bankrupt.",
    ghost: "identity-theft anxiety detected → credit-monitoring ads",
  },
  {
    id: "shield",
    n: "06",
    a: 0.84,
    b: 1,
    title: "The",
    accent: "shield.",
    tone: "cyan",
    status: "reversed · signal starved",
    caption: "Redact the signals and the auction has less to sell. Every field you close drops your price.",
    ghost: "user exploring defenses · segment: privacy-aware · CPM falling",
  },
];

/** progress stops → illustrative milliseconds */
export const TC_STOPS = [0, 0.07, 0.22, 0.37, 0.54, 0.69, 0.84, 1];
export const TC_MS = [0, 0, 14, 40, 100, 150, 200, 200];

export const toneVar: Record<Tone, string> = {
  cyan: "var(--cyan)",
  amber: "var(--amber)",
  crimson: "var(--crimson)",
  lime: "var(--lime)",
};
export const toneText: Record<Tone, string> = {
  cyan: "text-cyan",
  amber: "text-amber",
  crimson: "text-crimson",
  lime: "text-lime",
};

/* Fictional bidder archetypes — illustrative, not real companies. */
export const BIDDERS = [
  { name: "Retail DSP", bid: 0.58 },
  { name: "Data broker", bid: 0.32 },
  { name: "Insurance lead-gen", bid: 0.74 },
  { name: "Short-term lender", bid: 1 },
  { name: "Political consult.", bid: 0.62 },
  { name: "Offshore · unknown", bid: 0.4 },
  { name: "Travel DSP", bid: 0.5 },
  { name: "Auto-loan", bid: 0.68 },
  { name: "Health-adjacent", bid: 0.8 },
  { name: "Gaming network", bid: 0.36 },
  { name: "Luxury retail", bid: 0.84 },
  { name: "Crypto exchange", bid: 0.46 },
] as const;
export const WINNER = 3;

export type Packet = { id: string; label: string; value: string; key: string; inference: string };

const KEYS: Record<string, string> = {
  timezone: "tz",
  language: "lang",
  screen: "scr",
  platform: "plat",
  gpu: "gpu",
  canvas: "cvh",
  clock: "hr",
  gpc: "gpc",
  network: "net",
};

const PLACEHOLDER: Packet[] = [
  ["timezone", "Timezone"],
  ["language", "Languages"],
  ["screen", "Screen"],
  ["platform", "Platform"],
  ["gpu", "GPU"],
  ["canvas", "Canvas hash"],
].map(([id, label]) => ({ id, label, value: "reading…", key: KEYS[id], inference: "fingerprint component" }));

/** the visitor's live (unredacted) signals, max 6; placeholders before the dossier is compiled */
export function toPackets(fields: ShadowField[], redacted: Set<string>): Packet[] {
  const live = fields.filter((f) => !redacted.has(f.id)).slice(0, 6);
  if (!fields.length) return PLACEHOLDER;
  if (!live.length) return [{ id: "none", label: "Signals", value: "all redacted", key: "sig", inference: "nothing left to sell" }];
  return live.map((f) => ({ id: f.id, label: f.label, value: f.value, key: KEYS[f.id] ?? f.id.slice(0, 4), inference: f.inference }));
}

/** FNV-1a, hex — deterministic pseudo-ID built from the visitor's own values */
export function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** realistic-looking (fake) tracking-pixel request, one param per line */
export function pixelLines(packets: Packet[]): string[] {
  const seed = packets.map((p) => p.value).join("|");
  const uid = fnv(seed) + fnv(seed + "#");
  const enc = (v: string) => encodeURIComponent(v).replace(/%20/g, "+").slice(0, 38);
  return [
    "GET https://px.adtrack.example/p.gif",
    "  ?ev=click&v=2",
    `  &uid=${uid}`,
    ...packets.map((p) => `  &${p.key}=${enc(p.value)}`),
    `  &ref=${enc("knowyourdata/home")}`,
    `  &cb=${fnv(uid).slice(0, 6)}`,
    "← 200 OK · image/gif · 1×1",
  ];
}

/** mulberry32 — seeded PRNG for deterministic particles (used in effects only) */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r2 = (n: number) => Math.round(n * 100) / 100;
