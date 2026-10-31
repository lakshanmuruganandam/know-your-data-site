/**
 * The Live Browser Audit — test definitions + runners.
 *
 * Every runner touches browser APIs only when called (from an effect / click
 * handler), so this module is SSR-safe to import. Zero third-party network:
 * WebRTC uses `iceServers: []` (host candidates only, no STUN) and the only
 * request made is a same-origin HEAD to read this site's own HSTS header.
 */

import type { Status, Tone } from "@/components/ui";
import type { ShadowField } from "@/lib/shadow";

export type TestId = "webrtc" | "canvas" | "gpc" | "partition" | "locale" | "https" | "entropy";
export type Verdict = Exclude<Status, "scan" | "idle">;
export type Fact = { k: string; v: string; tone?: Tone };
export type IpKind = "mdns" | "private" | "public" | "ipv6" | "loopback";
export type Ip = { raw: string; masked: string; kind: IpKind };
export type CanvasProof = { a: string; b: string; ha: string; hb: string; prev: string | null };

export type Result = {
  status: Verdict;
  verdict: string;
  facts: Fact[];
  note?: string;
  ips?: Ip[];
  canvas?: CanvasProof;
};

export type Logger = (line: string, tone?: Tone) => void;
export type RunCtx = { log: Logger; report: (f: ShadowField) => void };
export type Fix = { where: string; how: string };

export type TestMeta = {
  id: TestId;
  title: string;
  /** what it checks, one line, shown before the scan reaches it */
  probe: string;
  /** weight in the 0–100 exposure score */
  weight: number;
  heuristic?: boolean;
  ghost: string;
  risk: string;
  fixes: Fix[];
};

export const TESTS: TestMeta[] = [
  {
    id: "webrtc",
    title: "WebRTC local-IP leak",
    probe: "RTCPeerConnection · host ICE candidates",
    weight: 20,
    ghost: "lan ip 192.168.x.x → household graph · links phone+laptop · +$0.30 CPM",
    risk:
      "Any page can open a WebRTC connection without asking and read the ICE candidates your browser gathers. Host candidates can contain your device's LAN address (e.g. 192.168.1.23) — a stable, fairly rare value that links devices on the same network and survives cookie clearing. Modern Chromium/Safari hide it behind a random “xxxx.local” mDNS name. With a STUN server a page can also learn your public IP even behind some VPNs; we don't test that because it would mean contacting a third party — use BrowserLeaks for that.",
    fixes: [
      { where: "Brave", how: "Settings → Privacy and security → WebRTC IP handling policy → “Disable non-proxied UDP”." },
      { where: "Firefox", how: "about:config → media.peerconnection.ice.default_address_only = true (or media.peerconnection.enabled = false to switch WebRTC off)." },
      { where: "uBlock Origin", how: "Dashboard → Settings → tick “Prevent WebRTC from leaking local IP addresses”." },
      { where: "Chrome / Edge", how: "mDNS masking is on by default — a leak usually means a camera/mic grant or enterprise policy. Google's “WebRTC Network Limiter” extension forces the safe policy." },
    ],
  },
  {
    id: "canvas",
    title: "Canvas fingerprint randomisation",
    probe: "render ×2 · compare with last visit",
    weight: 20,
    ghost: "canvas hash stable → cookieless re-id across sites · retention: forever",
    risk:
      "Drawing the same text and shapes produces slightly different pixels on every GPU / driver / font stack. Hash the pixels and you get a cookieless ID that persists across sites and private windows. Defences either add invisible noise (Brave “farbling”, Firefox fingerprinting protection, Safari private browsing) so the hash changes per session or per read, or make everyone render identically (Tor / Mullvad Browser).",
    fixes: [
      { where: "Brave", how: "Shields → Block fingerprinting → “Standard” (default) adds per-site, per-session canvas noise." },
      { where: "Firefox", how: "Settings → Privacy & Security → Enhanced Tracking Protection → “Strict” (enables fingerprinting protection). Heavier: about:config → privacy.resistFingerprinting = true." },
      { where: "Mullvad / Tor Browser", how: "Uniform canvas output by design — you look like every other user." },
      { where: "Chrome / Edge", how: "No built-in canvas defence. Switching browsers is the 1-click fix." },
    ],
  },
  {
    id: "gpc",
    title: "Global Privacy Control & DNT",
    probe: "navigator.globalPrivacyControl · doNotTrack",
    weight: 10,
    ghost: "no gpc signal → flag: sale_permitted=1 · ccpa opt-out: none on file",
    risk:
      "Global Privacy Control is a one-bit “do not sell or share my data” signal. Under California law businesses must treat it as a valid opt-out, and several other US states recognise it. The older Do Not Track header was voluntary, almost universally ignored, and is now deprecated — on its own it mostly adds one more bit of fingerprint.",
    fixes: [
      { where: "Firefox", how: "Settings → Privacy & Security → Website Privacy Preferences → tick “Tell websites not to sell or share my data”." },
      { where: "Brave / DuckDuckGo", how: "On by default — nothing to do." },
      { where: "Chrome / Edge", how: "Install EFF's Privacy Badger, which sends GPC on every request." },
    ],
  },
  {
    id: "partition",
    title: "Third-party storage partitioning",
    probe: "engine + Storage Access API",
    weight: 15,
    heuristic: true,
    ghost: "3p cookie jar shared → cross-site join key · retargeting: eligible",
    risk:
      "If an embedded tracker (ad iframe, social button, analytics pixel) can read the same cookie on every site, it can stitch your browsing into one profile. Partitioning gives each top-level site its own cookie jar. A first-party page cannot directly read whether your third-party cookies are blocked, so this result is inferred from your engine, version and Storage Access API support — treat it as a heuristic.",
    fixes: [
      { where: "Chrome", how: "Settings → Privacy and security → Third-party cookies → “Block third-party cookies”. Chrome kept them on by default after abandoning deprecation (2024–25)." },
      { where: "Firefox", how: "Total Cookie Protection is on by default since Firefox 103; ETP “Strict” goes further." },
      { where: "Safari", how: "Settings → Privacy → keep “Prevent cross-site tracking” on (default)." },
      { where: "Brave", how: "Shields → Cookies → “Block cross-site cookies” (default)." },
    ],
  },
  {
    id: "locale",
    title: "Timezone & locale leak",
    probe: "Intl.DateTimeFormat · navigator.languages",
    weight: 10,
    ghost: "tz ≠ vpn exit country → vpn user flagged · true region recovered",
    risk:
      "Your timezone and language list come from the operating system, not your IP — a VPN does not change them. A page that sees a Frankfurt exit IP but an Asia/Dubai clock and Arabic + English languages knows where you really are, and that you are hiding it. Unusual combinations (an expat language with a local timezone) make you rarer, and rarer means more identifiable.",
    fixes: [
      { where: "Mullvad / Tor Browser", how: "Report UTC and en-US to every site — matching millions of other users." },
      { where: "Firefox", how: "about:config → privacy.resistFingerprinting = true (spoofs UTC; side-effect: sites show UTC times)." },
      { where: "Everyone", how: "Know the limit: a VPN hides your IP, not your clock. Don't rely on it for region privacy." },
    ],
  },
  {
    id: "https",
    title: "HTTPS & HSTS",
    probe: "secure context · same-origin HEAD",
    weight: 10,
    ghost: "plaintext hop → isp reads path · ad injection possible · +1 data broker",
    risk:
      "Over plain HTTP your ISP, campus Wi-Fi or anyone on the network can read and rewrite every page. HSTS tells your browser to never even try HTTP for this site again, which blocks SSL-stripping attacks on the first hop of later visits. Browser-side, HTTPS-Only mode gives you the same guarantee for every site.",
    fixes: [
      { where: "Firefox", how: "Settings → Privacy & Security → HTTPS-Only Mode → “Enable in all windows”." },
      { where: "Chrome / Edge", how: "Settings → Privacy and security → Security → “Always use secure connections”." },
      { where: "Site owners", how: "Send Strict-Transport-Security: max-age=63072000; includeSubDomains; preload" },
    ],
  },
  {
    id: "entropy",
    title: "Fingerprint entropy",
    probe: "sum of shadow-profile bits",
    weight: 15,
    ghost: "≥33 bits → unique among 8B humans · no cookie needed · bid: premium",
    risk:
      "Each attribute (screen, GPU, fonts, timezone, canvas…) narrows down who you are. Bits add up: 33 bits is enough to single out one person among ~8.6 billion. The total here is an upper-bound estimate — it assumes the attributes are independent, which they are not quite — but the direction is right: fewer distinctive signals means a bigger crowd to hide in.",
    fixes: [
      { where: "Blend in", how: "Mullvad or Tor Browser — everyone shares one fingerprint." },
      { where: "Randomise", how: "Brave farbling — your fingerprint changes per site and per session." },
      { where: "This site", how: "Redact fields in the Shadow Profile dock and watch the number fall." },
    ],
  },
];

/* ── helpers ──────────────────────────────────────────────── */

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function hash(text: string): Promise<string> {
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
    }
  } catch {}
  // cyrb53 fallback for insecure contexts (crypto.subtle unavailable)
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")).slice(0, 16);
}

function classify(addr: string): IpKind {
  if (/\.local\.?$/i.test(addr)) return "mdns";
  if (addr.includes(":")) return addr === "::1" ? "loopback" : "ipv6";
  const [a, b] = addr.split(".").map(Number);
  if (a === 127) return "loopback";
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127)) return "private";
  return "public";
}

function mask(addr: string, kind: IpKind): string {
  if (kind === "mdns") return addr.length > 18 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr;
  if (kind === "ipv6") {
    const g = addr.split(":").filter(Boolean);
    return `${g[0] ?? ""}:${g[1] ?? "••••"}:••••:••••:…`;
  }
  const p = addr.split(".");
  return p.length === 4 ? `${p[0]}.${p[1]}.x.•••` : "•••";
}

/* ── 1 · WebRTC ───────────────────────────────────────────── */

async function webrtc({ log, report }: RunCtx): Promise<Result> {
  const RTC = typeof window !== "undefined" ? window.RTCPeerConnection : undefined;
  if (!RTC) {
    log("  RTCPeerConnection is undefined — WebRTC disabled", "lime");
    return { status: "pass", verdict: "WebRTC is switched off — nothing to leak.", facts: [{ k: "RTCPeerConnection", v: "unavailable", tone: "lime" }] };
  }
  log("> probing RTCPeerConnection (iceServers: [] · no STUN · zero network)…");
  const found = new Set<string>();
  let pc: RTCPeerConnection | null = null;
  try {
    const conn = new RTC({ iceServers: [] });
    pc = conn;
    conn.createDataChannel("kyd-probe");
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 2500);
      conn.onicecandidate = (e) => {
        if (!e.candidate) {
          clearTimeout(t);
          resolve();
          return;
        }
        const addr = e.candidate.address || e.candidate.candidate.split(" ")[4];
        if (addr) found.add(addr);
      };
      conn
        .createOffer()
        .then((o) => conn.setLocalDescription(o))
        .catch(() => {
          clearTimeout(t);
          resolve();
        });
    });
    for (const line of conn.localDescription?.sdp.match(/^a=candidate:.*$/gm) ?? []) {
      const addr = line.split(" ")[4];
      if (addr) found.add(addr);
    }
  } catch {
    log("  peer connection refused by the browser", "lime");
    return { status: "pass", verdict: "Browser blocked the peer connection — nothing gathered.", facts: [{ k: "RTCPeerConnection", v: "blocked", tone: "lime" }] };
  } finally {
    pc?.close();
  }

  const ips: Ip[] = [...found].map((raw) => {
    const kind = classify(raw);
    return { raw, kind, masked: mask(raw, kind) };
  });
  const leaks = ips.filter((i) => i.kind !== "mdns");
  log(`  ${ips.length} candidate${ips.length === 1 ? "" : "s"} gathered · ${leaks.length} raw address${leaks.length === 1 ? "" : "es"}`, leaks.length ? "crimson" : "cyan");
  for (const ip of ips) log(`    host ${ip.masked}  [${ip.kind}]`, ip.kind === "mdns" ? "ink" : "crimson");

  const facts: Fact[] = [
    { k: "ICE servers", v: "none (host candidates only)" },
    { k: "candidates", v: String(ips.length) },
    { k: "mDNS-masked", v: String(ips.length - leaks.length), tone: "lime" },
    { k: "raw addresses", v: String(leaks.length), tone: leaks.length ? "crimson" : "lime" },
  ];

  if (!leaks.length) {
    return {
      status: "pass",
      verdict: ips.length ? "Only random .local mDNS names exposed — your LAN IP is hidden." : "No host candidates exposed at all.",
      facts,
      ips,
    };
  }
  report({
    id: "webrtc",
    label: "Local IP (WebRTC)",
    value: leaks.map((l) => l.masked).join(", "),
    bits: leaks.some((l) => l.kind === "public" || l.kind === "ipv6") ? 10 : 3,
    cpm: 0.3,
    inference: "LAN address → household graph, links devices on one network",
    defense: "uBlock Origin “Prevent WebRTC leaking” / Brave non-proxied UDP off",
  });
  return {
    status: "fail",
    verdict: `${leaks.length} raw IP address${leaks.length === 1 ? "" : "es"} readable by any page — no permission prompt.`,
    facts,
    ips,
  };
}

/* ── 2 · Canvas ───────────────────────────────────────────── */

const CANVAS_KEY = "kyd.canvas.prev";

function drawProbe(): string {
  const c = document.createElement("canvas");
  c.width = 260;
  c.height = 72;
  const g = c.getContext("2d");
  if (!g) throw new Error("no 2d context");
  const grad = g.createLinearGradient(0, 0, 260, 72);
  grad.addColorStop(0, "#00f2fe");
  grad.addColorStop(1, "#ff3366");
  g.fillStyle = "#0d0f15";
  g.fillRect(0, 0, 260, 72);
  g.fillStyle = grad;
  g.fillRect(8, 8, 70, 22);
  g.textBaseline = "alphabetic";
  g.font = "italic 600 19px Georgia, 'Times New Roman', serif";
  g.fillStyle = "#e8eaf0";
  g.fillText("Know Your Data ☠ 🛡️", 10, 52);
  g.font = "11px monospace";
  g.fillStyle = "rgba(0,255,136,0.85)";
  g.fillText("0xFEED·Ωπ∑·ℵ", 150, 24);
  g.globalCompositeOperation = "screen";
  g.shadowBlur = 8;
  g.shadowColor = "#ff3366";
  g.fillStyle = "rgba(255,176,32,0.6)";
  g.beginPath();
  g.arc(222, 46, 18, 0, Math.PI * 1.7, true);
  g.fill();
  return c.toDataURL();
}

async function canvas({ log }: RunCtx): Promise<Result> {
  log("> rendering canvas probe #1 (text · emoji · gradient · blend)…");
  let a: string;
  try {
    a = drawProbe();
  } catch {
    log("  canvas read-out blocked", "lime");
    return { status: "pass", verdict: "Canvas read-out is blocked — no hash can be taken.", facts: [{ k: "toDataURL", v: "blocked", tone: "lime" }] };
  }
  const ha = await hash(a);
  log(`  hash₁ ${ha}`, "cyan");
  await sleep(1000);
  log("> rendering probe #2 in a fresh canvas (+1.0s)…");
  const b = drawProbe();
  const hb = await hash(b);
  log(`  hash₂ ${hb}`, "cyan");

  let prev: string | null = null;
  try {
    prev = localStorage.getItem(CANVAS_KEY);
    localStorage.setItem(CANVAS_KEY, hb);
  } catch {}
  log(`  previous visit: ${prev ?? "— (first visit)"}`, "ink");

  const proof: CanvasProof = { a, b, ha, hb, prev };
  const facts: Fact[] = [
    { k: "in-session", v: ha === hb ? "identical" : "different", tone: ha === hb ? "amber" : "lime" },
    { k: "vs last visit", v: prev ? (prev === hb ? "identical" : "different") : "no record yet", tone: prev ? (prev === hb ? "crimson" : "lime") : "ink" },
    { k: "stored as", v: `localStorage["${CANVAS_KEY}"]` },
  ];

  if (ha !== hb)
    return { status: "pass", verdict: "Farbling active — the hash changes on every read.", facts, canvas: proof };
  if (prev && prev !== hb)
    return {
      status: "pass",
      verdict: "Stable this session, different from last visit — per-session randomisation.",
      facts,
      canvas: proof,
      note: "A browser/GPU-driver update or a different device can also change the hash; re-run after a restart to be sure.",
    };
  if (prev && prev === hb)
    return { status: "fail", verdict: "Identical hash across visits — a cookieless ID that follows you.", facts, canvas: proof };
  return {
    status: "warn",
    verdict: "Stable within this session. Come back after a browser restart to see if it persists.",
    facts,
    canvas: proof,
    note: "Brave seeds its noise per session, so a single visit cannot tell farbling from no defence. We saved this hash locally (never sent anywhere) to compare next time.",
  };
}

/* ── 3 · GPC & DNT ────────────────────────────────────────── */

async function gpc({ log }: RunCtx): Promise<Result> {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const w = window as Window & { doNotTrack?: string };
  log("> reading navigator.globalPrivacyControl, navigator.doNotTrack…");
  const g = n.globalPrivacyControl === true;
  const dntRaw = n.doNotTrack ?? w.doNotTrack ?? n.msDoNotTrack ?? null;
  const dnt = dntRaw === "1" || dntRaw === "yes";
  log(`  GPC=${g ? "1" : "unset"} · DNT=${dntRaw ?? "unset"}`, g ? "lime" : dnt ? "amber" : "crimson");
  const facts: Fact[] = [
    { k: "Sec-GPC", v: g ? "1 (sent with every request)" : "not sent", tone: g ? "lime" : "crimson" },
    { k: "DNT", v: dnt ? "1 (deprecated)" : dntRaw ?? "unset", tone: dnt ? "amber" : "ink" },
  ];
  if (g) return { status: "pass", verdict: "GPC on — a legally recognised opt-out from sale/sharing in California & other US states.", facts };
  if (dnt) return { status: "warn", verdict: "Only Do Not Track — deprecated, ignored by trackers, and an extra fingerprint bit.", facts };
  return { status: "fail", verdict: "No opt-out signal — sites may treat you as consenting to sale.", facts };
}

/* ── 4 · Storage partitioning (heuristic) ─────────────────── */

async function partition({ log }: RunCtx): Promise<Result> {
  log("> fingerprinting engine for partitioning policy (heuristic)…");
  const ua = navigator.userAgent;
  const nb = navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } };
  let brave = false;
  try {
    brave = (await nb.brave?.isBrave?.()) === true;
  } catch {}
  const ff = ua.match(/(?:Firefox|FxiOS)\/(\d+)/);
  const ios = /iPhone|iPad|iPod/.test(ua);
  const chromium = /Chrome\/|Chromium\/|CriOS\//.test(ua);
  const edge = /Edg(?:e|A|iOS)?\//.test(ua);
  const safari = !chromium && !ff && /Safari\//.test(ua);
  const hasSA = typeof document.hasStorageAccess === "function";
  const reqSA = typeof document.requestStorageAccess === "function";
  let saNow = "n/a";
  if (hasSA) {
    try {
      saNow = (await document.hasStorageAccess()) ? "granted (top-level)" : "not granted";
    } catch {
      saNow = "error";
    }
  }
  const engine = brave ? "Brave" : ios ? "WebKit (iOS)" : ff ? `Firefox ${ff[1]}` : safari ? "Safari" : edge ? "Edge" : chromium ? "Chrome / Chromium" : "unknown";
  log(`  engine=${engine} · hasStorageAccess=${hasSA} · requestStorageAccess=${reqSA}`, "cyan");
  const facts: Fact[] = [
    { k: "engine", v: engine },
    { k: "Storage Access API", v: hasSA && reqSA ? "supported" : hasSA || reqSA ? "partial" : "absent" },
    { k: "hasStorageAccess()", v: saNow },
    { k: "cookies enabled", v: String(navigator.cookieEnabled) },
    { k: "method", v: "heuristic — not a direct measurement", tone: "amber" },
  ];
  if (brave) return { status: "pass", verdict: "Brave blocks cross-site cookies and partitions storage by default.", facts };
  if (ios) return { status: "pass", verdict: "iOS forces WebKit — Intelligent Tracking Prevention blocks third-party cookies.", facts };
  if (ff) {
    const v = Number(ff[1]);
    return v >= 103
      ? { status: "pass", verdict: "Firefox Total Cookie Protection — every site gets its own cookie jar (default since v103).", facts }
      : { status: "warn", verdict: `Firefox ${v} predates default Total Cookie Protection (v103) — update.`, facts };
  }
  if (safari) return { status: "pass", verdict: "Safari ITP blocks third-party cookies by default.", facts };
  if (chromium)
    return {
      status: "warn",
      verdict: "Chromium partitions storage, but third-party cookies stay on unless you block them.",
      facts,
      note: "Chrome partitions localStorage/IndexedDB in third-party iframes, but abandoned its plan to remove third-party cookies — whether you blocked them in settings is invisible to this page.",
    };
  return { status: "warn", verdict: "Unknown engine — can't infer the partitioning policy.", facts };
}

/* ── 5 · Timezone & locale ────────────────────────────────── */

const REGION_TZ: Record<string, string[]> = {
  US: ["America/", "Pacific/Honolulu"], CA: ["America/"], MX: ["America/"], BR: ["America/"], AR: ["America/"],
  GB: ["Europe/London"], IE: ["Europe/Dublin"], FR: ["Europe/Paris"], DE: ["Europe/Berlin", "Europe/Busingen"],
  ES: ["Europe/Madrid", "Atlantic/Canary", "Africa/Ceuta"], IT: ["Europe/Rome"], NL: ["Europe/Amsterdam"],
  TR: ["Europe/Istanbul"], EG: ["Africa/Cairo"], AE: ["Asia/Dubai"], SA: ["Asia/Riyadh"], QA: ["Asia/Qatar"],
  PK: ["Asia/Karachi"], IN: ["Asia/Kolkata", "Asia/Calcutta"], BD: ["Asia/Dhaka"], CN: ["Asia/Shanghai", "Asia/Urumqi"],
  JP: ["Asia/Tokyo"], KR: ["Asia/Seoul"], SG: ["Asia/Singapore"], AU: ["Australia/"], NZ: ["Pacific/Auckland"],
};

async function locale({ log }: RunCtx): Promise<Result> {
  log("> reading Intl.DateTimeFormat().resolvedOptions()…");
  const ro = Intl.DateTimeFormat().resolvedOptions();
  const tz = ro.timeZone || "unknown";
  const off = -new Date().getTimezoneOffset();
  const offStr = `UTC${off >= 0 ? "+" : "−"}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`;
  const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).slice(0, 4);
  let region: string | undefined;
  try {
    region = new Intl.Locale(navigator.language).maximize().region;
  } catch {}
  const isUTC = off === 0 && /^(UTC|GMT|UCT|Universal|Zulu|Etc\/(UTC|GMT|UCT|Universal|Zulu|GMT[+-]0))$/.test(tz);
  const expected = region ? REGION_TZ[region] : undefined;
  const mismatch = !isUTC && !!expected && !expected.some((p) => tz.startsWith(p));
  const sample = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  log(`  tz=${tz} (${offStr}) · langs=${langs.join(",")}`, isUTC ? "lime" : "amber");
  if (mismatch) log(`  ! language region ${region} ≠ timezone ${tz}`, "amber");

  const facts: Fact[] = [
    { k: "timezone", v: `${tz} · ${offStr}`, tone: isUTC ? "lime" : "amber" },
    { k: "locale", v: ro.locale },
    { k: "languages", v: langs.join(", ") },
    { k: "date format", v: sample },
    { k: "lang region", v: region ? `${region}${mismatch ? " — mismatches timezone" : ""}` : "—", tone: mismatch ? "amber" : undefined },
  ];
  if (isUTC) return { status: "pass", verdict: "Reports UTC — your clock gives nothing away.", facts };
  return {
    status: "warn",
    verdict: `Your real region (${tz.split("/").pop()?.replace(/_/g, " ")}) is visible even behind a VPN.`,
    facts,
    note: mismatch
      ? `Interesting: your language says ${region} but your clock says ${tz}. Expat, traveller or VPN user — any of which is a rarer, more identifying combination.`
      : undefined,
  };
}

/* ── 6 · HTTPS & HSTS ─────────────────────────────────────── */

async function https({ log }: RunCtx): Promise<Result> {
  const { protocol, hostname } = location;
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname.endsWith(".localhost");
  log(`> protocol=${protocol} · isSecureContext=${window.isSecureContext}`);
  log("> HEAD same-origin (no-store) → reading Strict-Transport-Security…");
  let hsts: string | null = null;
  let fetched = false;
  try {
    const r = await fetch(location.href, { method: "HEAD", cache: "no-store" });
    fetched = true;
    hsts = r.headers.get("strict-transport-security");
  } catch {}
  const maxAge = Number(hsts?.match(/max-age=(\d+)/i)?.[1] ?? 0);
  log(`  HSTS: ${hsts ?? (fetched ? "absent" : "request failed")}`, hsts ? "lime" : "amber");
  const facts: Fact[] = [
    { k: "protocol", v: protocol.replace(":", ""), tone: protocol === "https:" ? "lime" : local ? "amber" : "crimson" },
    { k: "secure context", v: String(window.isSecureContext) },
    { k: "HSTS", v: hsts ?? (fetched ? "not sent" : "could not read"), tone: hsts ? "lime" : "amber" },
  ];
  if (hsts) {
    facts.push({ k: "max-age", v: `${maxAge}s ≈ ${Math.round(maxAge / 86400)} days` });
    facts.push({ k: "subdomains / preload", v: `${/includesubdomains/i.test(hsts) ? "yes" : "no"} / ${/preload/i.test(hsts) ? "yes" : "no"}` });
  }
  if (local)
    return {
      status: "warn",
      verdict: "Local dev server — localhost is a secure context by exemption, HSTS is checked in production.",
      facts,
      note: "Browsers treat localhost as trustworthy even over HTTP, so this run is not representative. Deploy over HTTPS and re-run.",
    };
  if (protocol !== "https:") return { status: "fail", verdict: "Plain HTTP — anyone on the network can read and rewrite this page.", facts };
  if (!hsts) return { status: "warn", verdict: "Encrypted, but no HSTS — a first-hop SSL-strip is still possible.", facts };
  return { status: "pass", verdict: `Encrypted and pinned to HTTPS for ${Math.round(maxAge / 86400)} days via HSTS.`, facts };
}

export const RUNNERS: Record<Exclude<TestId, "entropy">, (ctx: RunCtx) => Promise<Result>> = {
  webrtc,
  canvas,
  gpc,
  partition,
  locale,
  https,
};

/* ── 7 · Entropy (live — recomputed whenever the shadow profile changes) ── */

export function entropyResult(bits: number, oneIn: string, fieldCount: number): Result {
  const b = Math.round(bits * 10) / 10;
  const facts: Fact[] = [
    { k: "identifying bits", v: `${b} bits`, tone: b >= 33 ? "crimson" : b >= 18 ? "amber" : "lime" },
    { k: "uniqueness", v: `1 in ${oneIn}` },
    { k: "live fields", v: String(fieldCount) },
    { k: "world population", v: "≈ 8.2B ≈ 2^33" },
  ];
  if (b >= 33) return { status: "fail", verdict: `~${b} bits — you are 1 in ${oneIn}: unique on Earth, no cookie required.`, facts };
  if (b >= 18) return { status: "warn", verdict: `~${b} bits — 1 in ${oneIn}. Still a small, trackable crowd.`, facts };
  return { status: "pass", verdict: `~${b} bits — 1 in ${oneIn}. You blend into a large crowd.`, facts };
}

export const toneOf = (s: Status): Tone => (s === "pass" ? "lime" : s === "warn" ? "amber" : s === "fail" ? "crimson" : s === "scan" ? "cyan" : "ink");

/** exposure 0–100: fail = full weight, warn = half */
export function exposure(results: Partial<Record<TestId, Result>>): number {
  let s = 0;
  for (const t of TESTS) {
    const r = results[t.id];
    if (r?.status === "fail") s += t.weight;
    else if (r?.status === "warn") s += t.weight / 2;
  }
  return Math.round(s);
}
