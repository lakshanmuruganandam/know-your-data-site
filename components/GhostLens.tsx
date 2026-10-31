"use client";

/**
 * The Ghost Lens — the cursor is a window into the surveillance layer.
 *
 * Inside the circle the real page is re-filtered (backdrop-filter) into a
 * crimson X-ray, and the telemetry a session-replay script would record
 * about you streams live: coordinates, velocity, dwell, scroll depth,
 * the element you're on, and — if it has `data-ghost` — what an ad-tech
 * system would infer. All computed locally; nothing is stored or sent.
 *
 * Position updates go straight to CSS variables / textContent on rAF so the
 * lens never triggers React renders while moving.
 */

import { useEffect, useRef, useState } from "react";
import { useShadow } from "@/lib/shadow";

const R = 120;
const R_HOT = 160;

export function GhostLens() {
  const { ghost, setGhost, fields, redacted } = useShadow();
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tele = useRef<HTMLDivElement>(null);
  const infer = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<string[]>([]);

  fieldsRef.current = fields.filter((f) => !redacted.has(f.id)).map((f) => `${f.label.toLowerCase()}=${f.value}`);

  // only on devices with a real mouse
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setEnabled(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // "G" toggles the lens
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) setGhost(!ghost);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ghost, setGhost]);

  useEffect(() => {
    if (!enabled || !ghost) return;
    const el = root.current!;
    let x = -999,
      y = -999,
      lx = x,
      ly = y,
      cx = x,
      cy = y,
      r = R,
      targetR = R,
      vel = 0,
      events = 0,
      clicks = 0,
      visible = false,
      raf = 0,
      lastT = performance.now(),
      hoverSince = performance.now(),
      current: Element | null = null,
      currentGhost: string | null = null,
      lastLog = 0;
    const t0 = performance.now();
    const lines: string[] = [];

    const push = (s: string) => {
      lines.unshift(s);
      if (lines.length > 6) lines.pop();
      if (log.current) log.current.textContent = lines.join("\n");
    };

    const describe = (e: Element) => {
      const tagName = e.tagName.toLowerCase();
      const cls = (e.getAttribute("class") || "").split(/\s+/).filter((c) => c && !c.includes(":") && !c.includes("[")).slice(0, 1);
      const txt = (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 22);
      return `${tagName}${cls.length ? "." + cls[0] : ""}${txt ? ` "${txt}"` : ""}`;
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      events++;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      probe();
    };
    // what's under the lens changes on scroll too, not just on pointer moves
    const probe = () => {
      const under = document.elementFromPoint(x, y);
      if (under && under !== current) {
        current = under;
        hoverSince = performance.now();
        const g = under.closest("[data-ghost]");
        const msg = g?.getAttribute("data-ghost") ?? null;
        if (msg !== currentGhost) {
          currentGhost = msg;
          targetR = msg ? R_HOT : R;
          if (infer.current) {
            infer.current.textContent = msg ?? "";
            infer.current.style.opacity = msg ? "1" : "0";
          }
          if (tag.current) tag.current.style.opacity = msg ? "1" : "0";
          if (msg) push(`infer  ${msg.slice(0, 44)}${msg.length > 44 ? "…" : ""}`);
        }
        const now = performance.now();
        if (now - lastLog > 220) {
          lastLog = now;
          push(`hover  ${describe(under)}`);
        }
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };
    const onDown = () => {
      clicks++;
      push(`click  #${clicks} @ ${Math.round(x)},${Math.round(y)}`);
      el.animate([{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 260 });
    };
    let lastScrollLog = 0;
    const onScroll = () => {
      if (visible) probe();
      const now = performance.now();
      if (now - lastScrollLog < 400) return;
      lastScrollLog = now;
      const d = Math.round((scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100);
      push(`scroll depth ${d}%`);
    };

    const tick = (t: number) => {
      const dt = Math.max(1, t - lastT);
      lastT = t;
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      r += (targetR - r) * 0.12;
      const inst = (Math.hypot(x - lx, y - ly) / dt) * 1000;
      vel += (inst - vel) * 0.1;
      lx = x;
      ly = y;
      el.style.setProperty("--lx", `${cx}px`);
      el.style.setProperty("--ly", `${cy}px`);
      el.style.setProperty("--lr", `${r}px`);
      if (tele.current) {
        const dwell = (performance.now() - hoverSince) / 1000;
        const depth = Math.round((scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100);
        const sess = Math.floor((t - t0) / 1000);
        const fp = fieldsRef.current;
        tele.current.textContent =
          `x ${String(Math.round(x)).padStart(4, "0")}  y ${String(Math.round(y)).padStart(4, "0")}\n` +
          `v ${String(Math.round(vel)).padStart(4, " ")} px/s ${vel < 60 ? "· READING" : vel > 1500 ? "· SKIMMING" : ""}\n` +
          `dwell ${dwell.toFixed(1)}s  depth ${depth}%\n` +
          `session ${String(Math.floor(sess / 60)).padStart(2, "0")}:${String(sess % 60).padStart(2, "0")}  ev ${events}\n` +
          (fp.length ? fp[Math.floor(t / 1800) % fp.length].slice(0, 34) : "fingerprint: compiling…");
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    push("session_start  replay.rec ● (local only)");
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, ghost]);

  if (!enabled || !ghost) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] opacity-0 transition-opacity duration-300"
      style={{ ["--lx" as string]: "-999px", ["--ly" as string]: "-999px", ["--lr" as string]: `${R}px` }}
    >
      {/* the X-ray: real page beneath, re-filtered, clipped to the lens */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: "circle(var(--lr) at var(--lx) var(--ly))",
          backdropFilter: "grayscale(1) contrast(1.6) brightness(0.9) invert(0.06)",
          WebkitBackdropFilter: "grayscale(1) contrast(1.6) brightness(0.9) invert(0.06)",
        }}
      >
        <div className="absolute inset-0 bg-crimson/25 mix-blend-color" />
        <div className="scanlines absolute inset-0 opacity-70" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,51,102,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,102,.18) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* telemetry inside the lens */}
        <div
          className="absolute whitespace-pre font-mono text-[9.5px] leading-[1.45] text-crimson"
          style={{ left: "calc(var(--lx) - var(--lr) * .62)", top: "calc(var(--ly) - var(--lr) * .55)" }}
          ref={tele}
        />
      </div>

      {/* ring + crosshair (not clipped) */}
      <div
        className="absolute rounded-full border border-crimson/70"
        style={{
          left: "calc(var(--lx) - var(--lr))",
          top: "calc(var(--ly) - var(--lr))",
          width: "calc(var(--lr) * 2)",
          height: "calc(var(--lr) * 2)",
          boxShadow: "0 0 0 1px rgba(255,51,102,.12), 0 0 40px rgba(255,51,102,.25), inset 0 0 30px rgba(255,51,102,.18)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="var(--crimson)" strokeWidth=".6" strokeDasharray="1 3.2" opacity=".8" />
        </svg>
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 bg-crimson" />
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-crimson" />
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.25em] text-crimson">
          ● REC · ghost layer
        </span>
      </div>

      {/* inference tag (what the tracker concluded) */}
      <div
        ref={tag}
        className="absolute max-w-[300px] opacity-0 transition-opacity duration-200"
        style={{ left: "calc(var(--lx) + var(--lr) + 10px)", top: "calc(var(--ly) - 14px)" }}
      >
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.25em] text-crimson/70">inference logged</div>
        <div ref={infer} className="rounded-md border border-crimson/40 bg-void/90 px-2.5 py-1.5 font-mono text-[11px] leading-snug text-crimson" />
      </div>

      {/* event stream, bottom-left */}
      <div className="absolute bottom-5 right-5 hidden w-[330px] rounded-lg border border-crimson/25 bg-void/80 p-3 backdrop-blur md:block">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-crimson/80">
          <span>session replay · what they log</span>
          <span className="text-ink-3">G to hide</span>
        </div>
        <div ref={log} className="h-[78px] overflow-hidden whitespace-pre font-mono text-[10px] leading-[1.3] text-ink-2" />
      </div>
    </div>
  );
}
