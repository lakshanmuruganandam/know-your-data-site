# Security

Know Your Data is a static, client-side site. It has no backend, database, accounts, API routes or cookies, and it stores nothing about visitors. The only `localStorage` it keeps is the visitor's own toolkit progress, which never leaves their browser.

## Hardening

- **Content-Security-Policy** with a fresh nonce on every request plus `'strict-dynamic'`. Only scripts Next.js renders may run, so injected inline scripts, inline event handlers and `javascript:` URLs are refused. The policy also sets:
  - `default-src 'self'` and `connect-src 'self'`
  - `object-src`, `frame-src`, `worker-src` and `child-src` to `'none'`
  - `base-uri 'none'` and `frame-ancestors 'none'`
  - `upgrade-insecure-requests`
- **Other headers:**
  - HSTS (2 years, includeSubDomains, preload)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer`
  - COOP and CORP set to `same-origin`
  - `Origin-Agent-Cluster`
  - a Permissions-Policy that disables camera, microphone, geolocation, payment, sensors, USB/serial/HID, ad-auction and topics APIs
  - `X-Powered-By` removed
- **No third parties.** Fonts are self-hosted at build time, and there are no CDNs or analytics.
- **Safe rendering.** There is no `dangerouslySetInnerHTML`, `eval` or `innerHTML` with user input, and live text updates use `textContent`. The legal generator's `mailto:` link is built with `encodeURIComponent`, and outbound links use `rel="noopener noreferrer"`.
- **Dependencies.** Production dependencies pass `npm audit`. Dependabot security updates, secret scanning and push protection are enabled, and `main` cannot be force-pushed or deleted.

## Reporting

Please report vulnerabilities privately through [GitHub security advisories](https://github.com/lakshanmuruganandam/know-your-data-site/security/advisories/new), not in a public issue.
