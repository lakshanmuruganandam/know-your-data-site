import Link from "next/link";
import { Logo } from "@/components/Navigation";
import { NAV } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-display text-lg font-extrabold">KNOW/YOUR/DATA</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
            A Millennium Fellowship 2026 initiative at IIT Delhi Abu Dhabi. This site practises what it preaches: no cookies,
            no analytics, no third-party requests. Every scan and calculator runs in your tab.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-lime/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> 0 trackers · 0 cookies · strict CSP
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">Modules</div>
          <ul className="mt-4 space-y-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-2 hover:text-ink">
                  <span className={`mr-2 font-mono text-[11px] ${l.tone}`}>{l.n}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">Built by</div>
          <p className="mt-4 text-sm text-ink-2">Lakshan Muruganandam · Aditya Rajan Sharma · Krishna</p>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">Research cohort</div>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Case studies — Anesh, Divisha, Divya Nukala, Krishna Gaur. Economics — Saatvik, Divyam, Gauri. Strategies — Lakshan, Farha, Sumayya.
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 sm:flex-row sm:px-8">
          <span>© 2026 Know Your Data · educational, not legal advice</span>
          <span>press G to toggle the ghost lens</span>
        </div>
      </div>
    </footer>
  );
}
