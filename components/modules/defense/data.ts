/**
 * Module 04 — The 4-Layer Defense Playbook.
 * Content is grounded in:
 *  - Lakshan Muruganandam, "Know Your Data" master dossier (§2 Toolkit, §4–7 Layers)
 *  - Farha Hareesh, "Strategies to safeguard user data"
 *  - Sumayya, "Project 1 — Browser & tracking defenses / privacy-first habits"
 */

export type SubTask = {
  id: string;
  text: string;
  how: string;
  /** shadow-profile field ids this sub-task redacts */
  redacts?: string[];
  ghost?: string;
};

export type Step = {
  id: string;
  n: number;
  title: string;
  accent: string;
  minutes: number;
  why: string;
  tasks: SubTask[];
  ghost: string;
  link?: { href: string; label: string };
};

export const TOOLKIT: Step[] = [
  {
    id: "accounts",
    n: 1,
    title: "Lock your",
    accent: "accounts",
    minutes: 20,
    why: "A stolen password exposes more data than any tracker does.",
    ghost: "reused password detected → credential-stuffing list · resale tier A",
    tasks: [
      {
        id: "bitwarden",
        text: "Install Bitwarden and import your saved passwords",
        how: "bitwarden.com → install app + browser extension. Settings → Import from your browser's password export (CSV), then delete that CSV.",
        ghost: "browser password store → readable by user-level malware",
      },
      {
        id: "reused",
        text: "Change reused passwords — email, uni login, bank first",
        how: "Bitwarden → Tools → Reports → Reused / Weak passwords. Use the generator; master passphrase = 5–6 random diceware words.",
        ghost: "same password on 9 sites → 1 breach unlocks all 9",
      },
      {
        id: "sms2fa",
        text: "Swap SMS codes for an authenticator app or passkey",
        how: "Install Ente Auth or Aegis. In each account's security settings, add an authenticator / passkey, then remove SMS as a fallback.",
        ghost: "sms 2fa → sim-swap target · emirates-id linked number",
      },
      {
        id: "backup",
        text: "Save backup codes offline",
        how: "Print them or store them in the vault — but never keep the TOTP seed in the same vault as your most critical account's password.",
      },
    ],
  },
  {
    id: "browser",
    n: 2,
    title: "Fix your",
    accent: "browser",
    minutes: 10,
    why: "Most web tracking happens through cookies, pixels and fingerprints in the browser.",
    ghost: "default chrome, no blocker → full third-party pixel graph",
    tasks: [
      {
        id: "engine",
        text: "Use Brave, or Firefox with Enhanced Tracking Protection = Strict",
        how: "Firefox: Settings → Privacy & Security → Enhanced Tracking Protection → Strict. Brave: Shields → Trackers & ads blocking → Aggressive.",
        redacts: ["canvas", "gpu", "platform"],
        ghost: "canvas + webgl hash stable → cross-site id without cookies",
      },
      {
        id: "fpp",
        text: "Turn on fingerprinting protection (FPP daily, RFP / Mullvad for sensitive)",
        how: "about:config → privacy.fingerprintingProtection = true. For full uniformity use Mullvad Browser or privacy.resistFingerprinting (reports UTC, en-US, letterboxed window).",
        redacts: ["screen", "timezone", "language"],
        ghost: "screen 2560×1600 @2x + Asia/Dubai → 1 in 40k visitors",
      },
      {
        id: "ublock",
        text: "Add uBlock Origin and enable EasyPrivacy",
        how: "Install from addons.mozilla.org (Chrome only gets uBlock Origin Lite). Dashboard → Filter lists → tick EasyPrivacy + AdGuard URL Tracking Protection.",
        ghost: "no blocker → meta pixel fires on checkout · conversion +$0.31",
      },
      {
        id: "search",
        text: "Change search engine to DuckDuckGo or Brave Search",
        how: "Settings → Search → Default search engine. Your queries stop feeding an advertising profile.",
        ghost: "query 'visa overstay fine' → segment: immigration-anxious",
      },
      {
        id: "gpc",
        text: "Turn on Global Privacy Control",
        how: "Firefox: Settings → Privacy & Security → 'Tell websites not to sell or share my data'. Built into Brave & DuckDuckGo. Check at globalprivacycontrol.org.",
        redacts: ["gpc"],
        ghost: "no gpc header → legally free to sell · bid unrestricted",
      },
    ],
  },
  {
    id: "dns",
    n: 3,
    title: "Encrypt your",
    accent: "DNS",
    minutes: 3,
    why: "Without it, your ISP or campus Wi-Fi can log every site you visit.",
    ghost: "plaintext udp/53 → isp sees every domain you resolve",
    tasks: [
      {
        id: "android-dns",
        text: "Android: Private DNS → dns.quad9.net",
        how: "Settings → Network & internet → Private DNS → Private DNS provider hostname → dns.quad9.net (Samsung: Connections → More connection settings).",
        redacts: ["network"],
      },
      {
        id: "apple-dns",
        text: "iPhone / Mac: install Quad9 or Mullvad DNS profile",
        how: "Download the resolver's signed configuration profile, then Settings → Profile Downloaded → Install (Mac: System Settings → General → Device Management).",
        redacts: ["network"],
      },
      {
        id: "browser-dns",
        text: "Browser: DNS over HTTPS → Quad9 or Mullvad",
        how: "Firefox: Settings → Privacy & Security → DNS over HTTPS → Max Protection. Campus Wi-Fi: log in to the captive portal first.",
        redacts: ["network"],
        ghost: "doh on → campus resolver blind · domain log empty",
      },
    ],
  },
  {
    id: "phone",
    n: 4,
    title: "Stop your phone",
    accent: "tracking you",
    minutes: 10,
    why: "The advertising ID on your phone links your activity across every app.",
    ghost: "idfa/gaid present → 37 apps joined into one profile",
    tasks: [
      {
        id: "att",
        text: "iPhone: turn off 'Allow Apps to Request to Track'",
        how: "Settings → Privacy & Security → Tracking → off. Also Apple Advertising → Personalised Ads off.",
      },
      {
        id: "adid",
        text: "Android: delete the advertising ID",
        how: "Settings → Privacy → Ads → Delete advertising ID (Android 12+). Apps then receive a string of zeros.",
        ghost: "gaid 38400000-8cf0… → household graph link",
      },
      {
        id: "location",
        text: "Location: 'While using', Precise off except maps",
        how: "iOS: Location Services → each app. Android: Permission manager → Location → Allow only while using + approximate.",
        ghost: "precise gps 03:00 nightly → home address inferred",
      },
      {
        id: "perms",
        text: "Revoke camera, mic, contacts, Bluetooth where unneeded",
        how: "iOS: Privacy & Security → each category. Android: Privacy dashboard. Choose 'Selected photos' rather than full library access.",
      },
      {
        id: "unused",
        text: "Delete apps unopened for 3 months",
        how: "Deleting stops new collection — but the company keeps old data until you ask (Step 7).",
      },
    ],
  },
  {
    id: "identity",
    n: 5,
    title: "Hide your real",
    accent: "identity",
    minutes: 15,
    why: "Companies match your email and number (as SHA-256 hashes) to build one profile across apps and brokers.",
    ghost: "sha256(email) matched → customer match audience · 4 brokers",
    tasks: [
      {
        id: "alias-svc",
        text: "Sign up for SimpleLogin, addy.io or DuckDuckGo Email Protection",
        how: "All have free tiers. DuckDuckGo also strips email trackers from forwarded mail.",
      },
      {
        id: "alias-each",
        text: "Give every shop/app/newsletter its own alias",
        how: "Name it after the company — e.g. shop.x7f2@simplelogin.com. Spam on that alias names the leaker; switch it off.",
        ghost: "unique alias per merchant → hashed-email join broken",
      },
      {
        id: "guest",
        text: "Use guest checkout instead of accounts",
        how: "Fewer accounts = fewer databases holding you. Use a separate container/profile for one-offs.",
      },
      {
        id: "phone-no",
        text: "Withhold your phone number unless a bank or the law needs it",
        how: "In the UAE, mobile numbers are registered to your Emirates ID — any service holding it can tie the account to you.",
        ghost: "+971 number → emirates-id resolvable · identity confidence 0.99",
      },
    ],
  },
  {
    id: "scrub",
    n: 6,
    title: "Scrub what's",
    accent: "already out there",
    minutes: 20,
    why: "The steps above stop new tracking, but years of history are still stored.",
    ghost: "web & app activity since 2017 → 9 years of intent signals",
    tasks: [
      {
        id: "g-activity",
        text: "Google My Activity → auto-delete after 3 months",
        how: "myactivity.google.com → Web & App Activity, Timeline and YouTube History → Auto-delete → 3 months.",
      },
      {
        id: "g-ads",
        text: "Google My Ad Center → Personalised ads off",
        how: "myadcenter.google.com → Personalised ads → off. Also try 'Results about you' to remove your number/address from Search.",
      },
      {
        id: "meta-off",
        text: "Meta: clear & disconnect 'activity off Meta technologies'",
        how: "Accounts Center → Your information and permissions → Your activity off Meta technologies → Clear history → Manage future activity → Disconnect.",
        ghost: "off-meta activity: 212 sites reported you via pixel",
      },
      {
        id: "hibp",
        text: "Check every email on Have I Been Pwned",
        how: "haveibeenpwned.com → change any breached password, starting with email. Turn on 'Notify me'.",
      },
      {
        id: "ai-train",
        text: "Stop AI chats training on you",
        how: "ChatGPT: Settings → Data controls → Improve the model for everyone → off. LinkedIn: Data privacy → Data for Generative AI Improvement → off.",
        ghost: "prompts retained → model-training corpus · consent: implied",
      },
    ],
  },
  {
    id: "erasure",
    n: 7,
    title: "Make them",
    accent: "delete it",
    minutes: 10,
    why: "UAE PDPL (Federal Decree-Law No. 45 of 2021) gives you the right to see, stop and erase your data — legal rights are the only control over data a company already holds.",
    ghost: "erasure request received → retention clock: 30 days",
    link: { href: "/legal", label: "Open the PDPL letter generator" },
    tasks: [
      {
        id: "pick3",
        text: "Pick three apps or shops you no longer use",
        how: "Old food-delivery, loyalty and shopping accounts are the usual suspects.",
      },
      {
        id: "templateC",
        text: "Send the erasure request (Template C) to their privacy / DPO address",
        how: "Generate it on the Legal page, fill in your details, send it from the email the account uses.",
        ghost: "dpo@ inbox → request logged · deletion obligation triggered",
      },
      {
        id: "templateB",
        text: "Send a marketing objection (Template B, PDPL Art. 17) to spammers",
        how: "Any company that keeps texting or emailing you. Objection to automated decisions is a separate right (Art. 18).",
      },
      {
        id: "followup",
        text: "Note the date; follow up after 30 days",
        how: "Set a reminder. Keep the sent email as evidence.",
      },
    ],
  },
];

export const TOTAL_MIN = TOOLKIT.reduce((a, s) => a + s.minutes, 0); // 88 + rounding → "about 90"

/* ───────────────────────── THE FOUR LAYERS ───────────────────────── */

export type Panel = {
  id: string;
  title: string;
  blurb: string;
  code?: { code: string; lang: string; title: string };
  warn?: string;
  bullets?: string[];
  ghost?: string;
};

export type Layer = {
  id: string;
  n: number;
  name: string;
  where: string;
  stops: string;
  misses: string;
  tone: "cyan" | "lime" | "amber" | "crimson";
  ghost: string;
  panels: Panel[];
};

const USER_JS = `// user.js — save in your Firefox profile folder (find it at about:profiles)
// Each line can also be set by hand in about:config.

// --- Tracking protection ---
user_pref("browser.contentblocking.category", "strict");        // ETP Strict: Total Cookie Protection, FPP, query stripping
user_pref("privacy.trackingprotection.enabled", true);          // tracker blocking in normal windows
user_pref("privacy.fingerprintingProtection", true);            // FPP in normal windows too
user_pref("privacy.query_stripping.enabled", true);             // strip known click IDs
user_pref("privacy.globalprivacycontrol.enabled", true);        // send the GPC opt-out signal
user_pref("dom.private-attribution.submission.enabled", false); // no Privacy-Preserving Attribution

// --- Optional: full uniformity (expect breakage: UTC time, en-US, no dark mode) ---
// user_pref("privacy.resistFingerprinting", true);
// user_pref("privacy.resistFingerprinting.letterboxing", true);

// --- Network leaks ---
// Skip trr.mode=3 on campus Wi-Fi until you've logged in to the captive portal.
user_pref("network.trr.mode", 3);                               // DNS-over-HTTPS only, no plaintext fallback
user_pref("network.trr.uri", "https://dns.quad9.net/dns-query");
user_pref("network.dns.echconfig.enabled", true);               // Encrypted Client Hello
user_pref("media.peerconnection.ice.default_address_only", true); // WebRTC: don't expose local IPs
user_pref("network.http.referer.XOriginTrimmingPolicy", 2);     // cross-site referer = origin only
user_pref("dom.security.https_only_mode", true);
user_pref("geo.enabled", false);

// --- Mozilla telemetry and sponsored content ---
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
user_pref("browser.urlbar.suggest.quicksuggest.sponsored", false);`;

const UBO_RULES = `# uBlock Origin → Dashboard → tick "I am an advanced user" → My rules
# syntax: source  destination  type  action
# MEDIUM MODE (most students): the two lines below
* * 3p-script block
* * 3p-frame block
# HARD MODE: add this too — breaks most sites until you allow their CDNs
* * 3p block
# Allow a site's own CDN when it breaks (examples)
github.com githubassets.com * noop
youtube.com ytimg.com * noop`;

const UBO_FILTERS = String.raw`! uBlock Origin → Dashboard → My filters
! Block a tracker domain everywhere
||doubleclick.net^
||connect.facebook.net^$third-party
||analytics.tiktok.com^
! Strip click IDs and UTM tags from any URL
*$removeparam=/^(fbclid|gclid|dclid|msclkid|ttclid|igshid|mc_eid)$/
*$removeparam=/^utm_/
! Regex: block any subdomain of an ad exchange
/^https?:\/\/([a-z0-9-]+\.)*adnxs\.com\//$third-party
! Cosmetic: hide a newsletter overlay on one site
example.com##.newsletter-modal
! Block third-party web fonts (font fingerprinting)
*$font,third-party`;

const WIN_DOH = `# PowerShell as administrator — Quad9 over HTTPS, no plaintext fallback
Add-DnsClientDohServerAddress -ServerAddress 9.9.9.9 -DohTemplate https://dns.quad9.net/dns-query -AllowFallbackToUdp $False -AutoUpgrade $True
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses 9.9.9.9,149.112.112.112
# Then: Settings > Network & internet > Wi-Fi > Hardware properties >
#       DNS server assignment > Edit > DNS over HTTPS: On`;

const LINUX_DOT = `# /etc/systemd/resolved.conf  — then: sudo systemctl restart systemd-resolved
[Resolve]
DNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net
DNSOverTLS=yes
DNSSEC=yes
FallbackDNS=

# Verify you're on encrypted Quad9 (answer should be "doh." or "dot.")
dig +short txt proto.on.quad9.net`;

const WIREGUARD = `# /etc/wireguard/wg0.conf  (client)  — bring up with: sudo wg-quick up wg0
[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>      # generate: wg genkey | tee priv | wg pubkey > pub
Address = 10.66.0.2/32
DNS = 10.66.0.1                         # resolver reachable only inside the tunnel
# Kill switch: reject anything not leaving through the tunnel
PostUp  = iptables -I OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT
PreDown = iptables -D OUTPUT ! -o %i -m mark ! --mark $(wg show %i fwmark) -m addrtype ! --dst-type LOCAL -j REJECT

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = vpn.example.org:51820
AllowedIPs = 0.0.0.0/0, ::/0            # route everything, incl. IPv6, to prevent leaks
PersistentKeepalive = 25`;

const WIN_REG = String.raw`:: Run in an elevated Command Prompt. Not on a university-managed laptop.
:: Minimum telemetry on Home/Pro ("Required" = 1). 0 is honoured only on Enterprise/Education.
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 1 /f

:: Disable the advertising ID by policy
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f

:: Remove Recall where the optional feature exists (Copilot+ PCs)
DISM /Online /Disable-Feature /FeatureName:Recall

:: Group Policy equivalent (Pro/Edu): gpedit.msc →
::   Computer Configuration > Administrative Templates > Windows Components >
::   Data Collection and Preview Builds > Allow Diagnostic Data → Enabled: "Diagnostic data off" / Required`;

const MAC_CMDS = `# Analytics: System Settings → Privacy & Security → Analytics & Improvements → all off
# Ads:       Privacy & Security → Apple Advertising → Personalised Ads off
# Location:  Location Services → System Services → Significant Locations off

sudo fdesetup status                                                    # confirm FileVault is on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on  # inbound firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on  # ignore pings & probes`;

const ADB = `# Phone: Settings → About → tap Build number 7× → Developer options → USB debugging on
adb devices                                             # confirm the phone is authorised
adb shell pm list packages | grep -i facebook          # find package names first

# Remove for the current user only (-k keeps data, no root, survives until factory reset)
adb shell pm uninstall -k --user 0 com.facebook.appmanager
adb shell pm uninstall -k --user 0 com.facebook.services
adb shell pm uninstall -k --user 0 com.facebook.system

# Changed your mind? Reinstall the system copy:
adb shell cmd package install-existing com.facebook.services`;

export const LAYERS: Layer[] = [
  {
    id: "browser",
    n: 1,
    name: "Browser",
    where: "On every web page",
    stops: "Cookies, pixels, fingerprinting, click IDs",
    misses: "Tracking inside apps; anything done while logged in",
    tone: "cyan",
    ghost: "browser layer bare → canvas, fonts, gpu harvested on load",
    panels: [
      {
        id: "engine",
        title: "Choose the engine",
        blurb:
          "Tor/Mullvad Browser make everyone look identical (uniformity). Brave adds per-site noise (farbling). Firefox can do either: FPP (targeted, low breakage) or RFP (Tor-like uniformity, breaks timezones & dark mode). Chrome protects nothing by default — and full uBlock Origin no longer runs on it (Manifest V3).",
        bullets: [
          "Daily: Firefox + FPP, or Brave with Shields on Aggressive",
          "Sensitive sessions (health, legal research): Mullvad Browser or RFP",
          "Fewer extensions = smaller fingerprint. Avoid canvas-noise add-ons — they make you more unique",
          "Test before & after at EFF Cover Your Tracks — aim for 'randomized' or 'shared by many', never 'unique'",
        ],
        ghost: "chrome default profile → 3p cookies live · fingerprint unique",
      },
      {
        id: "userjs",
        title: "Firefox user.js baseline",
        blurb: "Drop this into your profile folder. For a maintained, fully commented template use arkenfox user.js plus a user-overrides.js.",
        code: { code: USER_JS, lang: "js", title: "user.js · firefox" },
        ghost: "trr.mode=3 · ech on · webrtc local ip hidden → signal lost",
      },
      {
        id: "ubo-rules",
        title: "uBlock Origin — medium & hard mode",
        blurb: "Dynamic filtering rules. Medium mode blocks third-party scripts and frames; hard mode blocks every third-party request until you allow it.",
        code: { code: UBO_RULES, lang: "ubo", title: "my rules · dynamic filtering" },
        warn: "Hard mode will break most sites at first. Allow a site's CDN with a noop rule rather than turning uBlock off.",
        ghost: "3p-script blocked → header bidding never fires · $0 cpm",
      },
      {
        id: "ubo-filters",
        title: "uBlock Origin — custom filters",
        blurb: "Static filters: block tracker domains everywhere, strip click IDs (gclid, fbclid…) and UTM tags from every URL, and kill third-party web fonts.",
        code: { code: UBO_FILTERS, lang: "ubo", title: "my filters · static" },
        ghost: "fbclid stripped → ad click can't be joined to your session",
      },
      {
        id: "containers",
        title: "Container workflow",
        blurb:
          "Firefox Multi-Account Containers: make University, Personal, Social and Shopping containers and set 'Always open this site in…'. Logins never cross containers, so the Meta Pixel on a shop can't read your Instagram session.",
      },
    ],
  },
  {
    id: "network",
    n: 2,
    name: "Network",
    where: "Between device and internet",
    stops: "ISP / campus seeing domains (DNS, SNI) and your IP",
    misses: "Fingerprints, cookies, logins",
    tone: "lime",
    ghost: "sni 'clinic-booking.ae' in clear → health-intent segment",
    panels: [
      {
        id: "protocols",
        title: "DoH · DoT · ODoH · ECH — what each hides",
        blurb:
          "Encrypted DNS hides lookups from the local network but moves trust to the resolver. Encrypted Client Hello then hides the site name inside the TLS handshake. Only a VPN or Tor hides the destination IP address.",
        bullets: [
          "DoT — RFC 7858, port 853/TCP: encrypts queries, but its dedicated port is easy to spot or block",
          "DoH — RFC 8484, port 443: blends with web traffic; the resolver still sees your IP and all queries",
          "DoQ — RFC 9250, 853/UDP: like DoT with lower latency, less client support",
          "ODoH — RFC 9230 (Experimental): relay sees your IP, target sees the query, neither sees both",
          "ECH — RFC 9849 (2026): encrypts the ClientHello, incl. SNI; works only for sites publishing ECH keys in DNS (HTTPS records), needs encrypted DNS. RFC 8744 only describes the problem",
          "ESNI — obsolete draft, replaced by ECH",
        ],
        ghost: "dns udp/53 plaintext → full browsing log at the isp",
      },
      {
        id: "resolvers",
        title: "Pick a resolver",
        blurb: "Scores use the dossier's rubric: logging (4), jurisdiction (2), audit (2), blocking features (2).",
        bullets: [
          "Mullvad DNS 9/10 — https://dns.mullvad.net/dns-query · no logs · adblock.dns.mullvad.net blocks trackers",
          "Quad9 9/10 — https://dns.quad9.net/dns-query · Swiss non-profit · no IPs logged",
          "NextDNS 8/10 — per-device blocklists · free tier 300,000 queries/month",
          "AdGuard DNS 7/10 — dns.adguard-dns.com · blocks ads & trackers in every app",
          "Cloudflare 1.1.1.1 7/10 — logs kept 25 h, audited",
          "ISP default 2/10 — plaintext UDP 53, readable by anyone on the path",
        ],
      },
      {
        id: "win-doh",
        title: "Windows 11 — system-wide DoH",
        blurb: "Forces Quad9 over HTTPS with no fallback to plaintext.",
        code: { code: WIN_DOH, lang: "powershell", title: "powershell · admin" },
      },
      {
        id: "linux-dot",
        title: "Linux — systemd-resolved DoT",
        blurb: "System-wide DNS-over-TLS with DNSSEC. Android 9+: Settings → Network & internet → Private DNS → dns.quad9.net does the same.",
        code: { code: LINUX_DOT, lang: "ini", title: "/etc/systemd/resolved.conf" },
      },
      {
        id: "wireguard",
        title: "WireGuard VPN with kill switch",
        blurb:
          "A VPN moves trust from your ISP to the VPN provider — it does not make you anonymous and does nothing against fingerprinting. Prefer WireGuard (ChaCha20-Poly1305, Curve25519, ~4,000 lines). Providers: audited no-logs, anonymous payment (Mullvad, Proton VPN).",
        code: { code: WIREGUARD, lang: "ini", title: "wg0.conf · client template" },
        warn:
          "UAE: TDRA says VPNs aren't banned for legitimate use, but Federal Decree-Law 34/2021 penalises using one to commit a crime or evade detection, and unlicensed VoIP is restricted. Follow your campus acceptable-use policy. Never share your private key.",
        ghost: "tunnel up → isp sees one encrypted flow to 1 ip · segment lost",
      },
    ],
  },
  {
    id: "os",
    n: 3,
    name: "OS & Device",
    where: "Underneath every app",
    stops: "Advertising IDs, OS telemetry, permission grabs",
    misses: "What apps send once you grant access",
    tone: "amber",
    ghost: "advertising id present → cross-app join key for every sdk",
    panels: [
      {
        id: "windows",
        title: "Windows 11 — telemetry & ad ID",
        blurb:
          "Settings → Privacy & security → General: all off (incl. advertising ID). Diagnostics & feedback: optional data off, Delete diagnostic data, feedback = Never. Activity history: off + Clear. Recall: off + delete snapshots. Turn on Device encryption/BitLocker and save the recovery key offline.",
        code: { code: WIN_REG, lang: "cmd", title: "registry · group policy" },
        warn:
          "Registry edits change system policy — create a restore point first. Avoid aggressive debloat scripts that strip Windows Update or Defender: they open holes worse than the telemetry. GUI alternative: O&O ShutUp10++ → let it make a restore point → Actions → Apply only recommended settings.",
        ghost: "diagnostic data: optional → app usage + inking uploaded",
      },
      {
        id: "macos",
        title: "macOS — analytics opt-out",
        blurb: "Switch off Analytics & Improvements and Personalised Ads, then confirm disk encryption and the firewall. LuLu (free, open source) shows which apps phone home.",
        code: { code: MAC_CMDS, lang: "bash", title: "terminal · macOS" },
      },
      {
        id: "android",
        title: "Android — ADB debloat (no root)",
        blurb:
          "Delete the advertising ID, set location to approximate/while-using, use Private DNS with a blocking resolver, and audit apps with Exodus Privacy + TrackerControl. Then remove pre-installed bloat over ADB.",
        code: { code: ADB, lang: "bash", title: "adb · android platform-tools" },
        warn:
          "Removing the wrong package can break calls, SMS, the launcher or updates — or boot-loop the phone. Always list and research a package first; Universal Android Debloater Next Generation labels each one safe or risky. Never remove com.android.* or com.google.android.gms unless you know exactly why.",
        ghost: "preinstalled com.facebook.services → pings meta without the app",
      },
      {
        id: "ios",
        title: "iOS / iPadOS",
        blurb: "The highest-impact toggles, in order:",
        bullets: [
          "Privacy & Security → Tracking → 'Allow Apps to Request to Track' off (IDFA denied to all)",
          "Apple Advertising → Personalised Ads off; Analytics & Improvements → all off",
          "App Privacy Report on — see which domains each app contacts",
          "iCloud → Advanced Data Protection (E2E for backups, Photos, Notes); Stolen Device Protection on",
          "Lockdown Mode only for targeted users (journalists, activists)",
        ],
      },
    ],
  },
  {
    id: "identity",
    n: 4,
    name: "Identity",
    where: "At each service you log into",
    stops: "Hashed-email matching, password reuse, account takeover",
    misses: "Data a service already holds (→ use the law)",
    tone: "crimson",
    ghost: "sha256(email) → meta custom audience match · confidence 0.97",
    panels: [
      {
        id: "2fa",
        title: "Second factors, ranked",
        blurb: "Only FIDO2/WebAuthn factors are origin-bound — a fake login page can't capture them. Climb the ladder as high as each service allows.",
      },
      {
        id: "pm",
        title: "Password manager, not the browser store",
        blurb:
          "Browser stores are tied to the vendor account and, on Windows, readable by malware running as you. Use Bitwarden (or self-hosted Vaultwarden) for sync, or KeePassXC for an offline KDBX4/Argon2id vault. Master passphrase: 5–6 random EFF diceware words ≈ 65–78 bits.",
      },
      {
        id: "aliases",
        title: "Alias architecture",
        blurb: "One forwarding address per service → real inbox that's never given out.",
        bullets: [
          "SimpleLogin (Proton) — 10 free aliases, replies yes, open source",
          "addy.io — unlimited on shared domain, self-hostable",
          "DuckDuckGo Email Protection — unlimited @duck.com, strips trackers",
          "Firefox Relay — 5 free aliases; phone masking US/Canada only",
          "Apple Hide My Email — with iCloud+, built into Sign in with Apple",
        ],
        ghost: "alias forum.k1q9@addy.io → no join to shopping profile",
      },
    ],
  },
];

export const TWO_FA = [
  { name: "Hardware key", std: "FIDO2 / WebAuthn", phish: "Yes — origin-bound", attack: "Physical theft + PIN", use: "Email, password manager, uni SSO", score: 5 },
  { name: "Passkey", std: "FIDO2 / WebAuthn", phish: "Yes", attack: "Compromise of the syncing account", use: "Any site that supports them", score: 4.5 },
  { name: "Authenticator app (TOTP)", std: "RFC 6238", phish: "No", attack: "Real-time phishing proxy", use: "Sites without passkeys", score: 3 },
  { name: "Push approval", std: "Vendor-specific", phish: "Partly", attack: "MFA-fatigue spam", use: "Only with number matching", score: 2 },
  { name: "SMS / voice code", std: "None", phish: "No", attack: "SIM swap, SS7 interception, phishing", use: "Last resort — remove once an app is set up", score: 1 },
] as const;
