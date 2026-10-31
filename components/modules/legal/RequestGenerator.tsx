"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "framer-motion";
import { CalendarClock, Lock, Mail, ShieldAlert } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CopyButton, DownloadButton, Tag, spring } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  B_CLAUSES,
  CITE_RE,
  C_GROUNDS,
  PLACEHOLDER_RE,
  TEMPLATES,
  addDays,
  addMonths,
  buildLetter,
  fmt,
  type BClause,
  type CGround,
  type Juris,
  type TemplateId,
} from "./letters";

/* today's date, client-only (pages are statically rendered, so never bake the build date in) */
const noop = () => () => {};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function useToday() {
  return useSyncExternalStore(noop, todayISO, () => null);
}

const JURIS: { id: Juris; label: string; ghost: string }[] = [
  { id: "pdpl", label: "UAE PDPL", ghost: "jurisdiction=AE · regulator response: pending exec. regs" },
  { id: "gdpr", label: "GDPR", ghost: "jurisdiction=EU · fine exposure up to 4% turnover" },
  { id: "both", label: "Both", ghost: "dual-citation letter → escalated to legal, not support" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">
        {label}
        {hint && <span className="normal-case tracking-normal text-ink-3/80">{hint}</span>}
      </label>
      {children(id)}
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-line bg-void/70 px-4 py-3 text-[15px] text-ink placeholder:text-ink-3/70 outline-none transition-colors focus:border-cyan/60 focus:bg-void focus:shadow-[0_0_0_4px_rgba(0,242,254,0.08)]";

/* highlight citations (lime) and unfilled placeholders (amber) */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(CITE_RE).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} data-ghost="statutory citation parsed → ticket routed to DPO" className="rounded-[3px] bg-lime/[0.13] px-0.5 text-lime shadow-[inset_0_-1px_0_rgba(0,255,136,0.5)]">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>
            {part.split(PLACEHOLDER_RE).map((p, k) =>
              k % 2 === 1 ? (
                <span key={k} className="rounded-[3px] bg-amber/10 px-0.5 text-amber">
                  {p}
                </span>
              ) : (
                <Fragment key={k}>{p}</Fragment>
              ),
            )}
          </Fragment>
        ),
      )}
    </>
  );
}

export function RequestGenerator() {
  const today = useToday();
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [company, setCompany] = useState("");
  const [privacyEmail, setPrivacyEmail] = useState("");
  const [juris, setJuris] = useState<Juris>("pdpl");
  const [template, setTemplate] = useState<TemplateId>("A");
  const [bClauses, setB] = useState<Record<BClause, boolean>>({ consent: true, marketing: true, automated: true, sharing: true, notify: true });
  const [cGrounds, setC] = useState<Record<CGround, boolean>>({ purpose: false, consent: true, objection: false, unlawful: false });

  const date = today ? fmt(new Date(today + "T12:00:00")) : null;
  const { subject, body } = useMemo(
    () => buildLetter({ name, account, company, privacyEmail, date, juris, template, bClauses, cGrounds }),
    [name, account, company, privacyEmail, date, juris, template, bClauses, cGrounds],
  );
  const full = `Subject: ${subject}\n\n${body}`;
  const mailto = `mailto:${encodeURIComponent(privacyEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const slug = (company.trim() || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ref = useMemo(() => {
    let h = 0;
    for (const c of `${company}|${template}|${juris}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h.toString(36).toUpperCase().padStart(6, "0").slice(-6);
  }, [company, template, juris]);
  const reduce = useReducedMotion();

  /* "FILED" wax-seal stamp: slams onto the letter whenever it is copied, downloaded or handed to email */
  const [stamp, setStamp] = useState<{ id: number; word: string } | null>(null);
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paperRef, animatePaper] = useAnimate<HTMLDivElement>();
  useEffect(() => () => {
    if (stampTimer.current) clearTimeout(stampTimer.current);
  }, []);
  const fire = (word: string) => {
    if (stampTimer.current) clearTimeout(stampTimer.current);
    setStamp({ id: Date.now(), word });
    stampTimer.current = setTimeout(() => setStamp(null), 2200);
    if (!reduce && paperRef.current) void animatePaper(paperRef.current, { y: [0, 3, -1, 0], rotate: [0, -0.25, 0.1, 0] }, { delay: 0.22, duration: 0.3 });
  };
  const lineCount = body.split("\n").length + Math.ceil(body.length / 70);
  const printDur = Math.min(2.4, 0.5 + lineCount * 0.035);

  const emailOk = !privacyEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(privacyEmail.trim());

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* ── form ── */}
      <form className="glass space-y-6 rounded-2xl p-5 sm:p-7" onSubmit={(e) => e.preventDefault()} aria-label="Request details">
        <div className="flex items-start gap-3 rounded-xl border border-lime/25 bg-lime/[0.05] px-4 py-3" data-ghost="local-only form → keystroke capture: 0 events received">
          <Lock size={16} className="mt-0.5 shrink-0 text-lime" />
          <p className="text-[13px] leading-snug text-ink-2">
            <span className="text-lime">Runs entirely in your browser.</span> Nothing you type is sent, stored or logged — no network, no cookies, no storage. Close the tab and it&apos;s gone.
          </p>
        </div>

        {/* jurisdiction toggle */}
        <fieldset>
          <legend className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Jurisdiction</legend>
          <div className="relative mt-2 grid grid-cols-3 rounded-full border border-line bg-void/70 p-1">
            {JURIS.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setJuris(j.id)}
                aria-pressed={juris === j.id}
                data-ghost={j.ghost}
                className={cn("relative z-10 rounded-full px-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-cyan", juris === j.id ? "text-void" : "text-ink-2 hover:text-ink")}
              >
                {juris === j.id && <motion.span layoutId="juris-pill" transition={spring} className="absolute inset-0 -z-10 rounded-full bg-cyan" />}
                {j.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* template radio */}
        <fieldset>
          <legend className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Template</legend>
          <div className="mt-2 space-y-2" role="radiogroup">
            {TEMPLATES.map((t) => {
              const on = template === t.id;
              return (
                <label
                  key={t.id}
                  data-ghost={t.ghost}
                  className={cn(
                    "relative flex cursor-pointer gap-3 overflow-hidden rounded-xl border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan",
                    on ? "border-cyan/50 bg-cyan/[0.06]" : "border-line hover:border-line-2",
                  )}
                >
                  <input type="radio" name="template" value={t.id} checked={on} onChange={() => setTemplate(t.id)} className="sr-only" />
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg border font-display text-lg font-extrabold", on ? "border-cyan bg-cyan text-void" : "border-line-2 text-ink-2")}>{t.id}</span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium text-ink">{t.title}</span>
                      <span className="font-mono text-[10.5px] text-lime">
                        {juris !== "gdpr" && `PDPL ${t.pdpl}`}
                        {juris === "both" && " · "}
                        {juris !== "pdpl" && `GDPR ${t.gdpr}`}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{t.short}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <AnimatePresence initial={false} mode="popLayout">
          {template === "B" && (
            <motion.fieldset key="b" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <legend className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Clauses</legend>
              <div className="mt-2 space-y-1.5">
                {B_CLAUSES.map((c) => (
                  <Check key={c.id} checked={bClauses[c.id]} onChange={() => setB((s) => ({ ...s, [c.id]: !s[c.id] }))} label={c.label} />
                ))}
              </div>
            </motion.fieldset>
          )}
          {template === "C" && (
            <motion.fieldset key="c" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <legend className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Grounds for erasure</legend>
              <div className="mt-2 space-y-1.5">
                {C_GROUNDS.map((c) => (
                  <Check key={c.id} checked={cGrounds[c.id]} onChange={() => setC((s) => ({ ...s, [c.id]: !s[c.id] }))} label={c.label} />
                ))}
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Full name">
            {(id) => <input id={id} className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Aisha Al Mansoori" autoComplete="off" data-ghost="name typed locally → identity resolution: unavailable" />}
          </Field>
          <Field label="Account email / ID">
            {(id) => <input id={id} className={inputCls} value={account} onChange={(e) => setAccount(e.target.value)} placeholder="you@example.com" autoComplete="off" data-ghost="hashed-email capture attempt → no beacon on page" />}
          </Field>
          <Field label="Target company">
            {(id) => <input id={id} className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. a delivery app" autoComplete="off" data-ghost="target brand typed → churn-risk flag (if we could see it)" />}
          </Field>
          <Field label="Privacy email" hint="optional">
            {(id) => (
              <input
                id={id}
                type="email"
                className={cn(inputCls, !emailOk && "border-amber/60")}
                value={privacyEmail}
                onChange={(e) => setPrivacyEmail(e.target.value)}
                placeholder="privacy@ or dpo@company"
                autoComplete="off"
                aria-invalid={!emailOk}
                data-ghost="dpo@ address → request bypasses support chatbot"
              />
            )}
          </Field>
        </div>
        <p className="font-mono text-[11px] text-ink-3">
          Date ▸ <span className="text-ink-2">{date ?? "—"}</span> <span className="text-ink-3/70">(auto)</span>
        </p>
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          Tip: send from the email on your account so they can verify you without new documents. Don&apos;t attach your Emirates ID or passport unless they ask and explain why.
        </p>
      </form>

      {/* ── letter preview ── */}
      <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {/* printer slot the letter feeds out of */}
        <div aria-hidden className="relative -mb-3 h-2.5 rounded-full border border-line-2 bg-void shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
          <span className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-lime/30" />
        </div>
        <motion.div
          initial={{ y: -48, clipPath: "inset(0% 0% 100% 0%)" }}
          whileInView={{ y: 0, clipPath: "inset(-20% -20% -20% -20%)" }}
          viewport={{ once: true, margin: "0px 0px -3% 0px" }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        >
        <div
          ref={paperRef}
          className="relative overflow-hidden rounded-2xl border border-line-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)_inset]"
          style={{
            background:
              "radial-gradient(120% 60% at 100% 0%, rgba(0,255,136,0.05), transparent 55%), repeating-linear-gradient(180deg, transparent 0 27px, rgba(255,255,255,0.028) 27px 28px), linear-gradient(180deg, #12110E, #0C0B09)",
          }}
          data-ghost="legal letter rendering → this subject reads the fine print"
        >
          {/* margin rule */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-px bg-crimson/25 sm:left-10" />
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3 pl-9 sm:pl-14">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">Data subject request</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Ref KYD-{template}-{ref}
            </span>
          </div>
          <div className="px-5 py-6 pl-9 sm:px-8 sm:pl-14" aria-live="polite" aria-label="Letter preview">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-3">Subject</p>
            <p className="mt-1 font-display text-[17px] font-bold leading-snug text-ink sm:text-lg">
              <Highlighted text={subject} />
            </p>
            <div className="my-5 h-px bg-white/[0.07]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={template + juris}
                className="relative"
                exit={{ opacity: 0, y: -14, filter: "blur(3px)" }}
                transition={{ duration: 0.2 }}
              >
                {/* printer feed: the text is revealed line by line (stepped clip at the 28px line pitch) */}
                <motion.div
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)", y: 10 }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
                  transition={reduce ? { duration: 0.2 } : { clipPath: { duration: printDur, ease: steps(lineCount) }, y: { duration: printDur, ease: "linear" } }}
                  className="whitespace-pre-wrap break-words font-serif text-[16.5px] leading-[28px] text-ink/90"
                >
                  <Highlighted text={body} />
                  <span aria-hidden className="blink ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-cyan" />
                </motion.div>
                {/* print head riding the feed edge */}
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-3 h-[3px] rounded-full bg-lime/70 shadow-[0_0_14px_2px_rgba(0,255,136,0.45)]"
                    initial={{ top: "0%", opacity: 1 }}
                    animate={{ top: "100%", opacity: [1, 1, 0] }}
                    transition={{ top: { duration: printDur, ease: steps(lineCount) }, opacity: { duration: printDur + 0.25, times: [0, 0.9, 1] } }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FILED wax seal */}
          <AnimatePresence>
            {stamp && (
              <motion.div
                key={stamp.id}
                aria-hidden
                className="pointer-events-none absolute right-5 top-16 z-20 sm:right-10 sm:top-20"
                initial={reduce ? { opacity: 0 } : { scale: 2.8, opacity: 0, rotate: -32 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: -12 }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(3px)" }}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 520, damping: 22 }}
              >
                <div className="relative grid h-28 w-28 place-items-center rounded-full border-[3px] border-crimson/80 bg-crimson/[0.12] text-crimson mix-blend-screen shadow-[0_0_40px_-6px_rgba(255,51,102,0.7)] sm:h-32 sm:w-32">
                  <span className="absolute inset-2 rounded-full border border-dashed border-crimson/60" />
                  <span className="text-center">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-crimson/80">KYD · {template}</span>
                    <span className="block font-display text-[22px] font-extrabold uppercase leading-none tracking-[0.08em] sm:text-[26px]">{stamp.word}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-crimson/80">{date ?? "today"}</span>
                  </span>
                </div>
                {!reduce && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-crimson"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ delay: 0.12, duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <span className="contents" onClickCapture={() => fire("Filed")}>
            <CopyButton text={full} label="Copy letter" />
          </span>
          <span className="contents" onClickCapture={() => fire("Filed")}>
            <DownloadButton text={full} filename={`data-request-${template}-${slug || "company"}.txt`} />
          </span>
          <motion.a
            onClick={() => fire("Sent")}
            whileTap={{ scale: 0.97 }}
            href={mailto}
            data-ghost="mailto handoff → your mail client, not our servers"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-void transition hover:brightness-110"
          >
            <Mail size={14} />
            {privacyEmail.trim() ? "Open in email" : "Email (add address)"}
          </motion.a>
        </div>

        <DeadlinePanel today={today} juris={juris} />

        <div className="flex gap-3 rounded-xl border border-amber/30 bg-amber/[0.05] px-4 py-3">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber" />
          <p className="text-[13px] leading-snug text-ink-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber">Not legal advice.</span> These are educational templates from a student initiative. For a dispute with real consequences (employment, credit, immigration), consult a licensed UAE lawyer.
          </p>
        </div>
      </div>
    </div>
  );
}

function steps(n: number) {
  const k = Math.max(4, Math.min(80, n));
  return (t: number) => Math.min(1, Math.ceil(t * k) / k);
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[13.5px] text-ink-2 hover:bg-white/[0.03] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors", checked ? "border-lime bg-lime" : "border-line-2")}>
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="var(--void)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

function DeadlinePanel({ today, juris }: { today: string | null; juris: Juris }) {
  const chase = today ? fmt(addDays(today, 30)) : "—";
  const gdprDue = today ? fmt(addMonths(today, 1)) : "—";
  const gdprMax = today ? fmt(addMonths(today, 3)) : "—";
  return (
    <div className="glass rounded-2xl p-5" data-ghost="deadline tracked by subject → ignore-and-wait strategy fails">
      <Tag tone="cyan">
        <CalendarClock size={12} className="-ml-1" /> Response clock
      </Tag>
      <div className={cn("mt-4 grid gap-4", juris === "both" && "sm:grid-cols-2")}>
        {juris !== "gdpr" && (
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-lime">UAE PDPL</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
              The PDPL leaves the response period to its Executive Regulations, which had not been confirmed as published by late 2026 — so there is no statutory deadline yet. The letter asks for 30 days.
            </p>
            <p className="mt-2 font-mono text-[12px] text-ink">
              Chase on <span className="text-cyan">{chase}</span>, then escalate to the UAE Data Office (Art. 24) or the sector regulator.
            </p>
          </div>
        )}
        {juris !== "pdpl" && (
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-lime">GDPR Art. 12(3)</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
              Without undue delay and within one month of receipt. Extendable by two further months for complex or numerous requests — but they must tell you, with reasons, within the first month.
            </p>
            <p className="mt-2 font-mono text-[12px] text-ink">
              Due <span className="text-cyan">{gdprDue}</span> · absolute max <span className="text-amber">{gdprMax}</span>
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-ink-3">Dates assume you send today; the clock starts when they receive it.</p>
    </div>
  );
}
