"use client";

/**
 * The Shadow Profile — the site's signature mechanic.
 *
 * As soon as you land, the page quietly compiles the same dossier an ad-tech
 * script would: timezone, GPU, screen, languages, canvas hash… Nothing leaves
 * the tab. The dossier is rendered in the right-edge dock with a running
 * "auction price" for you. Completing defenses (or toggling them in the
 * Defense Hub) REDACTS fields, and your price drops.
 *
 * Only `localStorage` is used, to remember which fields you have redacted.
 * No cookies, no network.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ShadowField = {
  id: string;
  label: string;
  value: string;
  /** approx. bits of identifying entropy (EFF Panopticlick / AmIUnique ballparks) */
  bits: number;
  /** illustrative CPM uplift in USD for an ad-tech buyer */
  cpm: number;
  /** what a tracker infers from it */
  inference: string;
  /** which defense redacts it */
  defense: string;
};

type Ctx = {
  fields: ShadowField[];
  redacted: Set<string>;
  redact: (id: string) => void;
  restore: (id: string) => void;
  toggle: (id: string) => void;
  /** override/insert a field (e.g. a scanner found the WebRTC IP) */
  report: (f: ShadowField) => void;
  bits: number;
  price: number;
  ghost: boolean;
  setGhost: (v: boolean) => void;
  dockOpen: boolean;
  setDockOpen: (v: boolean) => void;
};

const ShadowCtx = createContext<Ctx | null>(null);
const KEY = "kyd.redacted.v1";
export const BASE_CPM = 0.35;

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function canvasHash(): Promise<string> {
  const c = document.createElement("canvas");
  c.width = 280;
  c.height = 60;
  const g = c.getContext("2d");
  if (!g) return "unavailable";
  g.textBaseline = "top";
  g.font = "16px 'Arial'";
  g.fillStyle = "#f60";
  g.fillRect(100, 1, 62, 20);
  g.fillStyle = "#069";
  g.fillText("KnowYourData ☠ 🛡️ 0xFEED", 2, 15);
  g.fillStyle = "rgba(102,204,0,0.7)";
  g.shadowBlur = 6;
  g.shadowColor = "#f0f";
  g.beginPath();
  g.arc(220, 30, 22, 0, Math.PI * 1.7, true);
  g.fill();
  return (await sha256(c.toDataURL())).slice(0, 16);
}

function gpu(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "blocked";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const s = String(r).replace(/ANGLE \((.*)\)/, "$1");
    return (s.split("Renderer: ").pop() ?? s).replace(/, Unspecified Version|, OpenGL.*$|Direct3D.*$/g, "").trim().slice(0, 48);
  } catch {
    return "blocked";
  }
}

async function collect(): Promise<ShadowField[]> {
  const n = navigator as Navigator & {
    deviceMemory?: number;
    globalPrivacyControl?: boolean;
    connection?: { effectiveType?: string };
    userAgentData?: { platform?: string };
  };
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -new Date().getTimezoneOffset() / 60;
  const hour = new Date().getHours();
  const dpr = window.devicePixelRatio;
  const platform = n.userAgentData?.platform || n.platform || "unknown";
  const fields: ShadowField[] = [
    {
      id: "timezone",
      label: "Timezone",
      value: `${tz} (UTC${offset >= 0 ? "+" : ""}${offset})`,
      bits: 3.0,
      cpm: 0.4,
      inference: `geo-segment: ${tz.split("/").pop()?.replace(/_/g, " ")} metro`,
      defense: "Firefox resistFingerprinting / Mullvad Browser (reports UTC)",
    },
    {
      id: "language",
      label: "Languages",
      value: (n.languages || [n.language]).slice(0, 3).join(", "),
      bits: 5.0,
      cpm: 0.15,
      inference: "language-audience + likely nationality",
      defense: "Brave / Tor-style language normalisation",
    },
    {
      id: "screen",
      label: "Screen",
      value: `${screen.width}×${screen.height} @${dpr}x`,
      bits: 4.8,
      cpm: 0.3,
      inference: dpr >= 2 ? "high-DPI device → premium-hardware owner" : "standard display",
      defense: "Letterboxing (Firefox RFP) / Mullvad Browser",
    },
    {
      id: "platform",
      label: "Platform",
      value: `${platform} · ${n.hardwareConcurrency ?? "?"} cores${n.deviceMemory ? ` · ${n.deviceMemory}GB+` : ""}`,
      bits: 3.5,
      cpm: platform.toLowerCase().includes("mac") ? 0.9 : 0.25,
      inference: platform.toLowerCase().includes("mac") ? "Apple user → higher bid tier" : "device-class segment",
      defense: "Brave fingerprint farbling",
    },
    {
      id: "gpu",
      label: "GPU",
      value: gpu(),
      bits: 6.5,
      cpm: 0.2,
      inference: "hardware fingerprint component (very stable)",
      defense: "Disable WebGL / Brave farbling",
    },
    {
      id: "canvas",
      label: "Canvas hash",
      value: await canvasHash(),
      bits: 8.4,
      cpm: 0.25,
      inference: "persistent cross-site ID without cookies",
      defense: "Brave farbling / Firefox canvas prompt",
    },
    {
      id: "clock",
      label: "Local hour",
      value: `${String(hour).padStart(2, "0")}:00 · ${hour < 6 || hour >= 23 ? "night owl" : hour < 12 ? "morning" : "day"}`,
      bits: 1.0,
      cpm: 0.1,
      inference: hour < 6 || hour >= 23 ? "late-night browsing → impulse-buy segment" : "routine schedule inferred",
      defense: "Unavoidable — but timezone spoofing blurs it",
    },
    {
      id: "gpc",
      label: "Opt-out signal",
      value: n.globalPrivacyControl ? "GPC = 1 (opted out)" : "none broadcast",
      bits: 1.0,
      cpm: n.globalPrivacyControl ? 0 : 0.2,
      inference: n.globalPrivacyControl ? "legally opted-out (in CA/CO…)" : "free to sell / share",
      defense: "Enable Global Privacy Control (Brave/Firefox/DuckDuckGo)",
    },
  ];
  if (n.connection?.effectiveType) {
    fields.push({
      id: "network",
      label: "Network",
      value: n.connection.effectiveType.toUpperCase(),
      bits: 1.5,
      cpm: 0.05,
      inference: "connection quality → income proxy",
      defense: "Firefox / Safari don't expose this API",
    });
  }
  return fields;
}

export function ShadowProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = useState<ShadowField[]>([]);
  const [redacted, setRedacted] = useState<Set<string>>(new Set());
  const [ghost, setGhost] = useState(true);
  const [dockOpen, setDockOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    collect().then((f) => alive && setFields((prev) => mergeFields(f, prev)));
    try {
      const raw = localStorage.getItem(KEY);
      // stored state is untrusted: keep only short id strings
      const ids: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(ids)) setRedacted(new Set(ids.filter((v): v is string => typeof v === "string" && v.length < 40).slice(0, 64)));
    } catch {}
    return () => {
      alive = false;
    };
  }, []);

  const persist = (s: Set<string>) => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...s]));
    } catch {}
    return s;
  };

  const redact = useCallback((id: string) => setRedacted((s) => persist(new Set(s).add(id))), []);
  const restore = useCallback(
    (id: string) =>
      setRedacted((s) => {
        const n = new Set(s);
        n.delete(id);
        return persist(n);
      }),
    [],
  );
  const toggle = useCallback(
    (id: string) =>
      setRedacted((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return persist(n);
      }),
    [],
  );
  const report = useCallback((f: ShadowField) => setFields((prev) => mergeFields(prev, [f])), []);

  const value = useMemo<Ctx>(() => {
    const live = fields.filter((f) => !redacted.has(f.id));
    return {
      fields,
      redacted,
      redact,
      restore,
      toggle,
      report,
      bits: live.reduce((a, f) => a + f.bits, 0),
      price: BASE_CPM + live.reduce((a, f) => a + f.cpm, 0),
      ghost,
      setGhost,
      dockOpen,
      setDockOpen,
    };
  }, [fields, redacted, redact, restore, toggle, report, ghost, dockOpen]);

  return <ShadowCtx.Provider value={value}>{children}</ShadowCtx.Provider>;
}

function mergeFields(a: ShadowField[], b: ShadowField[]) {
  const map = new Map(a.map((f) => [f.id, f]));
  for (const f of b) map.set(f.id, f);
  return [...map.values()];
}

export function useShadow() {
  const c = useContext(ShadowCtx);
  if (!c) throw new Error("useShadow must be used inside <ShadowProvider>");
  return c;
}

/** "1 in N" uniqueness from entropy bits */
export function oneIn(bits: number) {
  const n = Math.round(2 ** bits);
  if (n > 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n > 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n > 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
