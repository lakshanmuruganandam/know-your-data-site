# Know Your Data

An interactive privacy-intelligence platform from the **Millennium Fellowship 2026** cohort at **IIT Delhi Abu Dhabi**.
Built by Lakshan Muruganandam, Aditya Rajan Sharma and Krishna. Research by Anesh, Divisha, Divya Nukala and Krishna Gaur (case studies), Saatvik, Divyam and Gauri (economics), and Lakshan, Farha and Sumayya (strategies).

## The Ghost Layer UI

Every page has two layers: the one you read, and the one that reads you.

- **Ghost Lens.** Your cursor is a lens onto the surveillance layer. Inside it the page turns into a crimson X-ray, with live session-replay telemetry: position, velocity, dwell time, scroll depth. Any element tagged `data-ghost` also shows the inference an ad-tech system would log about it. Press **G** to toggle. It only appears on devices with a mouse.
- **Shadow Profile dock.** A dossier built in the tab from your real browser (timezone, GPU, canvas hash, screen, languages, GPC…). It shows a live illustrative CPM "auction price" and an identifiability estimate in bits. Completing the steps in the Defense toolkit redacts fields, and the price drops.
- **Proof, not promises.** The home page reads the Performance API live to show 0 cookies and 0 third-party requests.

## Modules

| Route | Module |
|---|---|
| `/audit` | Live browser audit: WebRTC IP leak, canvas farbling, GPC/DNT, storage partitioning (heuristic), timezone leak, HTTPS/HSTS, entropy |
| `/vault` | Corporate Exploit Vault: 10 declassified case files with exploit-chain diagrams |
| `/economics` | Expected-cost simulator, Meta fines vs revenue waffle, slowed-down RTB auction |
| `/defense` | 90-minute, 7-step toolkit with a countdown and 4-layer armour configs (user.js, uBlock, DoH/ECH, WireGuard, OS telemetry, 2FA ladder) |
| `/legal` | UAE PDPL / GDPR request generator (access, objection, erasure), article explorer and a jurisdiction picker |
| `/tools` | Big-tech swap matrix, a searchable directory of 36 tools and a stack builder |

## Privacy guarantees

- Everything runs client-side. There are no API routes, no analytics and no cookies.
- Fonts are self-hosted via `next/font`, downloaded at build time.
- A strict CSP (`default-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`) plus HSTS, `Referrer-Policy: no-referrer` and a locked-down Permissions-Policy are set in `next.config.ts`.
- `localStorage` is used only for the visitor's own toolkit progress, redactions and previous canvas hash.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · framer-motion · Lenis · lucide-react. Charts are hand-built SVG.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Deploy

```bash
gh repo create lakshanmuruganandam/know-your-data --public --source=. --push
npx vercel@latest           # link + preview
npx vercel@latest --prod    # production → know-your-data.vercel.app
```

No environment variables are needed.

*Educational project. Not legal advice.*
