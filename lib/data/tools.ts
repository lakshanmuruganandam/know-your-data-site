/* Privacy tools directory — Module 6.
 * UX ratings (1–10) and costs follow Lakshan Muruganandam's "Know Your Data" handbook §9 where
 * the handbook rates the tool; others are the team's estimate on the same scale (set-up effort +
 * daily friction for a typical student). Prices are approximate for late 2026 — re-check before paying.
 */

export type Category =
  | "Search"
  | "Browser"
  | "Messaging"
  | "Passwords"
  | "2FA"
  | "Email"
  | "Aliases"
  | "Cloud"
  | "Photos"
  | "DNS"
  | "Blocking"
  | "VPN"
  | "Maps";

/** End-to-end / zero-knowledge status. "na" = not applicable (no stored content, e.g. a browser or resolver). */
export type E2E = "yes" | "partial" | "no" | "na";

export interface Tool {
  id: string;
  name: string;
  category: Category;
  replaces: string[];
  openSource: boolean;
  selfHostable: boolean;
  zeroKnowledge: E2E;
  /** short caveat shown next to the E2E / licence badges */
  note?: string;
  protocols: string[];
  jurisdiction: string;
  ux: number;
  cost: string;
  free: boolean;
  oneLiner: string;
  url: string;
  ghost: string;
}

export const CATEGORIES: Category[] = [
  "Search",
  "Browser",
  "Messaging",
  "Passwords",
  "2FA",
  "Email",
  "Aliases",
  "Cloud",
  "Photos",
  "DNS",
  "Blocking",
  "VPN",
  "Maps",
];

export const TOOLS: Tool[] = [
  /* ── Search ── */
  {
    id: "searxng", name: "SearXNG", category: "Search", replaces: ["Google Search"],
    openSource: true, selfHostable: true, zeroKnowledge: "na", note: "public instances see your queries",
    protocols: ["Metasearch", "AGPL-3.0"], jurisdiction: "Instance-dependent (self-host)", ux: 6,
    cost: "Free", free: true, oneLiner: "Metasearch engine that queries others for you — run your own and nobody profiles you.",
    url: "https://docs.searxng.org", ghost: "metasearch proxy → query origin masked · profile join failed",
  },
  {
    id: "brave-search", name: "Brave Search", category: "Search", replaces: ["Google Search", "Bing"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "no profile kept; still sees queries",
    protocols: ["Own independent index", "Proprietary"], jurisdiction: "USA", ux: 8,
    cost: "Free; paid ad-free tier", free: true, oneLiner: "Independent web index, not a Bing reskin. Closed source, but keeps no search profile.",
    url: "https://search.brave.com", ghost: "search vendor switched → 'intent' signal lost · −$0.04 CPM",
  },
  {
    id: "duckduckgo", name: "DuckDuckGo", category: "Search", replaces: ["Google Search"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "not zero-knowledge — sees queries, keeps no profile",
    protocols: ["Mostly Bing-sourced results", "Proprietary"], jurisdiction: "USA", ux: 9,
    cost: "Free (contextual ads)", free: true, oneLiner: "Easiest swap: same habits, contextual ads instead of a profile built on you.",
    url: "https://duckduckgo.com", ghost: "contextual-only ads → no history to auction",
  },
  {
    id: "startpage", name: "Startpage", category: "Search", replaces: ["Google Search"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "majority-owned by ad firm System1 since 2019",
    protocols: ["Google-sourced results", "Proprietary"], jurisdiction: "Netherlands", ux: 8,
    cost: "Free (contextual ads)", free: true, oneLiner: "Google's results without Google seeing your IP or cookies; 'Anonymous View' proxy.",
    url: "https://www.startpage.com", ghost: "google results, no google cookie → identity graph gap",
  },

  /* ── Browser ── */
  {
    id: "mullvad-browser", name: "Mullvad Browser", category: "Browser", replaces: ["Chrome", "Edge"],
    openSource: true, selfHostable: false, zeroKnowledge: "na",
    protocols: ["Gecko", "Tor Browser hardening", "MPL-2.0"], jurisdiction: "Sweden", ux: 7,
    cost: "Free", free: true, oneLiner: "Tor Browser's fingerprint uniformity without the Tor network — pair with a VPN.",
    url: "https://mullvad.net/browser", ghost: "fingerprint = identical to every other user · uniqueness 0 bits",
  },
  {
    id: "brave", name: "Brave", category: "Browser", replaces: ["Chrome", "Edge"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "switch off crypto & AI extras",
    protocols: ["Chromium", "Fingerprint farbling", "MPL-2.0"], jurisdiction: "USA", ux: 9,
    cost: "Free", free: true, oneLiner: "Chrome-compatible with built-in blocking and per-site fingerprint noise.",
    url: "https://brave.com", ghost: "canvas hash randomised per site → cross-site match failed",
  },
  {
    id: "firefox", name: "Firefox (hardened)", category: "Browser", replaces: ["Chrome", "Edge"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "needs set-up: FPP/RFP, arkenfox",
    protocols: ["Gecko", "Total Cookie Protection", "MPL-2.0"], jurisdiction: "USA (Mozilla)", ux: 8,
    cost: "Free", free: true, oneLiner: "The only major non-Chromium engine; full uBlock Origin support and deep about:config hardening.",
    url: "https://www.mozilla.org/firefox", ghost: "gecko engine detected → chromium-only trackers degraded",
  },
  {
    id: "tor-browser", name: "Tor Browser", category: "Browser", replaces: ["Chrome", "Incognito mode"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "slow; exits often blocked",
    protocols: ["Onion routing", "Gecko", "BSD-3 / MPL-2.0"], jurisdiction: "USA (non-profit)", ux: 5,
    cost: "Free", free: true, oneLiner: "Strongest anonymity: three-hop routing and every user looks identical.",
    url: "https://www.torproject.org", ghost: "exit node ip → geo unknown · subject lost",
  },
  {
    id: "librewolf", name: "LibreWolf", category: "Browser", replaces: ["Chrome", "Firefox defaults"],
    openSource: true, selfHostable: false, zeroKnowledge: "na",
    protocols: ["Gecko fork", "uBlock bundled", "MPL-2.0"], jurisdiction: "Community project", ux: 6,
    cost: "Free", free: true, oneLiner: "Firefox fork hardened out of the box: no telemetry, uBlock Origin pre-installed.",
    url: "https://librewolf.net", ghost: "telemetry endpoint unreachable · cohort: privacy-literate",
  },

  /* ── Messaging ── */
  {
    id: "signal", name: "Signal", category: "Messaging", replaces: ["WhatsApp", "Telegram", "SMS"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "minimal metadata; sealed sender",
    protocols: ["Signal Protocol", "PQXDH", "Double Ratchet", "AGPL-3.0"], jurisdiction: "USA (non-profit)", ux: 9,
    cost: "Free (donations)", free: true, oneLiner: "The default: E2E everything, with metadata kept to account-creation and last-seen date.",
    url: "https://signal.org", ghost: "social graph export blocked · contact-list upload: none",
  },
  {
    id: "session", name: "Session", category: "Messaging", replaces: ["WhatsApp", "Telegram"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "no phone number; onion-routed",
    protocols: ["Session Protocol", "Onion routing", "GPL-3.0"], jurisdiction: "Switzerland", ux: 7,
    cost: "Free", free: true, oneLiner: "No phone number or email to sign up; messages travel over a decentralised node network.",
    url: "https://getsession.org", ghost: "no phone number → identity anchor missing",
  },
  {
    id: "simplex", name: "SimpleX Chat", category: "Messaging", replaces: ["WhatsApp", "Telegram"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "no user IDs at all",
    protocols: ["SMP relays", "Double Ratchet", "AGPL-3.0"], jurisdiction: "UK", ux: 6,
    cost: "Free", free: true, oneLiner: "No user identifiers of any kind — not even random ones. Run your own relay if you want.",
    url: "https://simplex.chat", ghost: "no persistent user id → cannot build graph",
  },

  /* ── Passwords ── */
  {
    id: "bitwarden", name: "Bitwarden", category: "Passwords", replaces: ["Chrome password manager", "LastPass"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "audited",
    protocols: ["AES-256", "PBKDF2 / Argon2id", "GPL / AGPL"], jurisdiction: "USA", ux: 9,
    cost: "Free; premium ~USD 19.80/yr", free: true, oneLiner: "Audited zero-knowledge vault on every device; free tier is enough for most.",
    url: "https://bitwarden.com", ghost: "credential reuse ↓ → breach-replay value of subject falls",
  },
  {
    id: "vaultwarden", name: "Vaultwarden", category: "Passwords", replaces: ["Chrome password manager"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "unofficial Bitwarden-compatible server",
    protocols: ["Bitwarden API", "Rust", "AGPL-3.0"], jurisdiction: "Self-hosted", ux: 6,
    cost: "Free + hosting", free: true, oneLiner: "Lightweight Rust server that speaks Bitwarden — use the official apps against your own box.",
    url: "https://github.com/dani-garcia/vaultwarden", ghost: "vault on private host → no third-party custody",
  },
  {
    id: "keepassxc", name: "KeePassXC", category: "Passwords", replaces: ["Chrome password manager"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "local file, no server at all",
    protocols: ["KDBX4", "Argon2id", "GPL-3.0"], jurisdiction: "Local file (community)", ux: 6,
    cost: "Free", free: true, oneLiner: "Offline encrypted file vault. You own the file; sync it however you like.",
    url: "https://keepassxc.org", ghost: "offline vault → nothing to subpoena from a vendor",
  },
  {
    id: "proton-pass", name: "Proton Pass", category: "Passwords", replaces: ["Chrome password manager", "iCloud Keychain"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "clients open source",
    protocols: ["E2E vault", "Passkeys", "Built-in aliases", "GPL-3.0"], jurisdiction: "Switzerland", ux: 8,
    cost: "Free tier; paid plans", free: true, oneLiner: "Passwords, passkeys and hide-my-email aliases in one E2E vault.",
    url: "https://proton.me/pass", ghost: "alias per signup → email join key broken",
  },

  /* ── 2FA ── */
  {
    id: "ente-auth", name: "Ente Auth", category: "2FA", replaces: ["SMS codes", "Google Authenticator"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "E2E-encrypted backup",
    protocols: ["TOTP / HOTP", "E2E sync", "AGPL-3.0"], jurisdiction: "USA (data in EU)", ux: 9,
    cost: "Free", free: true, oneLiner: "Cross-platform authenticator with encrypted backup, so a lost phone isn't a lockout.",
    url: "https://ente.io/auth", ghost: "sim-swap surface removed · account-takeover odds ↓",
  },
  {
    id: "aegis", name: "Aegis", category: "2FA", replaces: ["SMS codes", "Google Authenticator"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "Android only; local encrypted vault",
    protocols: ["TOTP / HOTP", "Encrypted local vault", "GPL-3.0"], jurisdiction: "Community (local)", ux: 8,
    cost: "Free", free: true, oneLiner: "Android authenticator with an encrypted local vault and exportable backups.",
    url: "https://getaegis.app", ghost: "2fa seeds local-only → no cloud copy to breach",
  },

  /* ── Email ── */
  {
    id: "proton-mail", name: "Proton Mail", category: "Email", replaces: ["Gmail", "Outlook"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "except subject lines & metadata; clients open source",
    protocols: ["OpenPGP", "Zero-access encryption", "GPL-3.0 clients"], jurisdiction: "Switzerland", ux: 9,
    cost: "Free tier; paid ~EUR 4–5/mo", free: true, oneLiner: "Zero-access encrypted mailbox — Proton can't read stored mail; no content scanning.",
    url: "https://proton.me/mail", ghost: "inbox unscannable → purchase receipts invisible",
  },
  {
    id: "tuta", name: "Tuta", category: "Email", replaces: ["Gmail", "Outlook"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "encrypts subject lines too",
    protocols: ["TutaCrypt", "ML-KEM + x25519", "GPL-3.0 clients"], jurisdiction: "Germany", ux: 7,
    cost: "Free tier; paid ~EUR 3/mo", free: true, oneLiner: "Post-quantum hybrid encryption that also covers subject lines and calendar.",
    url: "https://tuta.com", ghost: "subject lines encrypted → intent keywords: none",
  },

  /* ── Aliases ── */
  {
    id: "simplelogin", name: "SimpleLogin", category: "Aliases", replaces: ["Your real email at every shop"],
    openSource: true, selfHostable: true, zeroKnowledge: "na", note: "forwarder sees mail in transit",
    protocols: ["Forwarding aliases", "Reply-from-alias", "AGPL-3.0"], jurisdiction: "France (Proton-owned)", ux: 8,
    cost: "10 free aliases; premium ~USD 30/yr", free: true, oneLiner: "A different address for every sign-up — kill one when it leaks or spams.",
    url: "https://simplelogin.io", ghost: "hashed-email match failed → customer-list upload useless",
  },
  {
    id: "addy", name: "addy.io", category: "Aliases", replaces: ["Your real email at every shop"],
    openSource: true, selfHostable: true, zeroKnowledge: "partial", note: "optional GPG encryption of forwards",
    protocols: ["Forwarding aliases", "GPG", "AGPL-3.0"], jurisdiction: "UK", ux: 7,
    cost: "Free unlimited shared-domain aliases", free: true, oneLiner: "Unlimited aliases on the free tier, with optional GPG-encrypted forwarding.",
    url: "https://addy.io", ghost: "unique alias per vendor → leak source attributable",
  },

  /* ── Cloud ── */
  {
    id: "nextcloud", name: "Nextcloud", category: "Cloud", replaces: ["Google Drive", "OneDrive", "Google Calendar"],
    openSource: true, selfHostable: true, zeroKnowledge: "partial", note: "optional E2E folders",
    protocols: ["WebDAV", "CalDAV / CardDAV", "AGPL-3.0"], jurisdiction: "Germany / self-hosted", ux: 6,
    cost: "Free self-hosted", free: true, oneLiner: "Your own Drive + Calendar + Contacts on a server you control.",
    url: "https://nextcloud.com", ghost: "files on private server → document-content signals: none",
  },
  {
    id: "cryptomator", name: "Cryptomator", category: "Cloud", replaces: ["Plain Google Drive / OneDrive"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "no server — encrypts before upload",
    protocols: ["Client-side AES-256", "GPL-3.0"], jurisdiction: "Germany", ux: 8,
    cost: "Free desktop; one-off mobile fee", free: true, oneLiner: "Encrypted vault on top of any cloud — keep the free OneDrive, lose the readable files.",
    url: "https://cryptomator.org", ghost: "uploads = ciphertext · ml scan yield 0",
  },
  {
    id: "syncthing", name: "Syncthing", category: "Cloud", replaces: ["Google Drive sync", "Dropbox"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "peer-to-peer; no server needed",
    protocols: ["Peer-to-peer", "TLS 1.3", "MPL-2.0"], jurisdiction: "Peer-to-peer (community)", ux: 6,
    cost: "Free", free: true, oneLiner: "Syncs folders directly between your own devices — no cloud in the middle.",
    url: "https://syncthing.net", ghost: "device-to-device sync → no cloud copy",
  },
  {
    id: "proton-drive", name: "Proton Drive", category: "Cloud", replaces: ["Google Drive", "iCloud Drive"],
    openSource: true, selfHostable: false, zeroKnowledge: "yes", note: "clients open source",
    protocols: ["E2E encryption", "GPL-3.0 clients"], jurisdiction: "Switzerland", ux: 8,
    cost: "5 GB free; paid plans", free: true, oneLiner: "Drop-in E2E-encrypted cloud drive with familiar sharing links.",
    url: "https://proton.me/drive", ghost: "drive contents encrypted client-side · scan denied",
  },

  /* ── Photos ── */
  {
    id: "ente-photos", name: "Ente Photos", category: "Photos", replaces: ["Google Photos", "iCloud Photos"],
    openSource: true, selfHostable: true, zeroKnowledge: "yes", note: "on-device face/search ML",
    protocols: ["E2E encryption", "On-device ML", "AGPL-3.0"], jurisdiction: "USA (data in EU)", ux: 8,
    cost: "Free tier; paid storage", free: true, oneLiner: "E2E photo backup with face search done on your device, not theirs.",
    url: "https://ente.io", ghost: "faceprint extraction blocked · location exif encrypted",
  },

  /* ── DNS ── */
  {
    id: "quad9", name: "Quad9", category: "DNS", replaces: ["8.8.8.8 (Google DNS)", "ISP DNS"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "no IP addresses logged; non-profit",
    protocols: ["DoH", "DoT", "DNSCrypt", "Malware blocking"], jurisdiction: "Switzerland", ux: 9,
    cost: "Free", free: true, oneLiner: "Swiss non-profit resolver: blocks malware domains, logs no IPs.",
    url: "https://quad9.net", ghost: "dns via 9.9.9.9 (encrypted) → isp lookup log empty",
  },
  {
    id: "mullvad-dns", name: "Mullvad DNS", category: "DNS", replaces: ["8.8.8.8 (Google DNS)", "ISP DNS"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "no account; optional blocklists",
    protocols: ["DoH", "DoT", "Ad/tracker blocking"], jurisdiction: "Sweden", ux: 9,
    cost: "Free", free: true, oneLiner: "No-log encrypted DNS with optional ad, tracker and malware blocking.",
    url: "https://mullvad.net/help/dns-over-https-and-dns-over-tls", ghost: "tracker domains NXDOMAIN · beacon delivery 0%",
  },
  {
    id: "nextdns", name: "NextDNS", category: "DNS", replaces: ["8.8.8.8 (Google DNS)", "ISP DNS"],
    openSource: false, selfHostable: false, zeroKnowledge: "na", note: "logging configurable (off → 2 yrs)",
    protocols: ["DoH", "DoT", "Custom blocklists"], jurisdiction: "USA", ux: 8,
    cost: "Free 300,000 queries/mo; paid unlimited", free: true, oneLiner: "Per-device filtering dashboard with custom blocklists — turn logging off.",
    url: "https://nextdns.io", ghost: "per-device blocklist → sdk callbacks dropped",
  },
  {
    id: "adguard-dns", name: "AdGuard DNS", category: "DNS", replaces: ["8.8.8.8 (Google DNS)", "ISP DNS"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "anonymised statistics",
    protocols: ["DoH", "DoT", "DoQ", "Ad/tracker blocking"], jurisdiction: "Cyprus", ux: 7,
    cost: "Free public resolver; paid private DNS", free: true, oneLiner: "Public resolver that blocks ads and trackers at the DNS level for the whole device.",
    url: "https://adguard-dns.io", ghost: "ad domains sinkholed → impressions undeliverable",
  },
  {
    id: "adguard-home", name: "AdGuard Home", category: "DNS", replaces: ["Router / ISP DNS"],
    openSource: true, selfHostable: true, zeroKnowledge: "na", note: "you control the logs",
    protocols: ["DNS sinkhole", "DoH upstream", "GPL-3.0"], jurisdiction: "Self-hosted", ux: 5,
    cost: "Free + a Raspberry Pi", free: true, oneLiner: "Network-wide blocking for every device at home, forwarding to an encrypted upstream.",
    url: "https://github.com/AdguardTeam/AdGuardHome", ghost: "whole-household block → smart-tv acr pings dropped",
  },

  /* ── Blocking ── */
  {
    id: "ublock-origin", name: "uBlock Origin", category: "Blocking", replaces: ["Chrome's default 'tracking protection'"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "full version needs Firefox (MV2)",
    protocols: ["Filter lists", "EasyPrivacy", "GPL-3.0"], jurisdiction: "Community (Raymond Hill)", ux: 9,
    cost: "Free", free: true, oneLiner: "The blocker that matters. Add EasyPrivacy and AdGuard URL Tracking lists.",
    url: "https://ublockorigin.com", ghost: "pixel blocked · conversion attribution broken",
  },

  /* ── VPN ── */
  {
    id: "mullvad-vpn", name: "Mullvad VPN", category: "VPN", replaces: ["Free 'VPN' apps", "Raw ISP connection"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "no email needed; cash accepted",
    protocols: ["WireGuard", "Audited apps", "GPL-3.0"], jurisdiction: "Sweden", ux: 8,
    cost: "Flat EUR 5/mo", free: false, oneLiner: "Numbered accounts, no email, audited no-logs — the anonymous-signup VPN.",
    url: "https://mullvad.net", ghost: "ip → vpn exit · household geo-match lost",
  },
  {
    id: "protonvpn", name: "Proton VPN", category: "VPN", replaces: ["Free 'VPN' apps", "Raw ISP connection"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "apps open source; audited no-logs",
    protocols: ["WireGuard", "OpenVPN", "Stealth", "GPL-3.0"], jurisdiction: "Switzerland", ux: 8,
    cost: "Free tier; paid plans", free: true, oneLiner: "The only reputable genuinely-free VPN tier; no ads, no data cap.",
    url: "https://protonvpn.com", ghost: "traffic tunnelled → isp clickstream sale blocked",
  },

  /* ── Maps ── */
  {
    id: "organic-maps", name: "Organic Maps", category: "Maps", replaces: ["Google Maps"],
    openSource: true, selfHostable: false, zeroKnowledge: "na", note: "fully offline; no account",
    protocols: ["OpenStreetMap", "Offline maps", "Apache-2.0"], jurisdiction: "Estonia (community)", ux: 7,
    cost: "Free", free: true, oneLiner: "Offline OpenStreetMap navigation — no account, no location history uploaded.",
    url: "https://organicmaps.app", ghost: "location history upload: none · footfall model starved",
  },
];

/** Big Tech → replacement swaps for the matrix at the top of the page. */
export interface Swap {
  bigTech: string;
  vendor: string;
  category: Category;
  harvest: string;
  alts: string[]; // tool ids
}

export const SWAPS: Swap[] = [
  { bigTech: "Google Search", vendor: "Alphabet", category: "Search", harvest: "every query, tied to your account", alts: ["duckduckgo", "brave-search", "startpage", "searxng"] },
  { bigTech: "Chrome", vendor: "Alphabet", category: "Browser", harvest: "browsing signals, Topics API", alts: ["brave", "firefox", "mullvad-browser", "librewolf", "tor-browser"] },
  { bigTech: "WhatsApp", vendor: "Meta", category: "Messaging", harvest: "who, when, how often — metadata", alts: ["signal", "session", "simplex"] },
  { bigTech: "Gmail", vendor: "Alphabet", category: "Email", harvest: "receipts, tickets, subscriptions", alts: ["proton-mail", "tuta"] },
  { bigTech: "Your real email", vendor: "Every shop", category: "Aliases", harvest: "hashed-email match across ad networks", alts: ["simplelogin", "addy"] },
  { bigTech: "Chrome Passwords", vendor: "Alphabet", category: "Passwords", harvest: "vault tied to the ad account", alts: ["bitwarden", "proton-pass", "keepassxc", "vaultwarden"] },
  { bigTech: "SMS codes", vendor: "Your carrier", category: "2FA", harvest: "SIM-swap target", alts: ["ente-auth", "aegis"] },
  { bigTech: "Google Drive", vendor: "Alphabet", category: "Cloud", harvest: "provider holds the keys", alts: ["proton-drive", "cryptomator", "nextcloud", "syncthing"] },
  { bigTech: "Google Photos", vendor: "Alphabet", category: "Photos", harvest: "faces, places, EXIF", alts: ["ente-photos"] },
  { bigTech: "8.8.8.8", vendor: "Alphabet", category: "DNS", harvest: "every domain you resolve", alts: ["quad9", "mullvad-dns", "nextdns", "adguard-dns", "adguard-home"] },
  { bigTech: "Google Maps", vendor: "Alphabet", category: "Maps", harvest: "location history, footfall", alts: ["organic-maps"] },
];

/** The handbook's "recommended default student stack" (§9.1). */
export const HANDBOOK_STACK: Partial<Record<Category, string>> = {
  Browser: "brave",
  Blocking: "ublock-origin",
  Search: "duckduckgo",
  Messaging: "signal",
  Passwords: "bitwarden",
  "2FA": "ente-auth",
  Aliases: "simplelogin",
  Email: "proton-mail",
  Cloud: "cryptomator",
};

export const toolById = (id: string) => TOOLS.find((t) => t.id === id);
