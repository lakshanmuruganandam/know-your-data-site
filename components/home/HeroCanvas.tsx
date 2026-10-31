"use client";

/**
 * Hero mesh: you are the bright node. Packets of your data stream out toward
 * labelled tracker nodes. Your cursor is a shield — nodes are repelled from
 * it and any packet that crosses it is destroyed (and counted).
 */

import { useEffect, useRef } from "react";

const TRACKERS = [
  "doubleclick.net",
  "connect.facebook.net",
  "google-analytics.com",
  "criteo.com",
  "analytics.tiktok.com",
  "adnxs.com",
  "scorecardresearch.com",
  "hotjar.com",
  "taboola.com",
  "amazon-adsystem.com",
  "bat.bing.com",
  "px.ads.linkedin.com",
  "jumpshot.io",
  "clearview.ai",
];

type Node = { x: number; y: number; vx: number; vy: number; r: number; label?: string; heat: number };
type Packet = { x: number; y: number; tx: number; ty: number; to: number; speed: number; alive: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

export function HeroCanvas({ onStats }: { onStats?: (s: { blocked: number; leaked: number }) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current!;
    const ctx = cvs.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0,
      t = 0;
    let nodes: Node[] = [];
    const packets: Packet[] = [];
    const sparks: Spark[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const shield = { x: 0, y: 0, r: 130 };
    let blocked = 0,
      leaked = 0,
      lastReport = 0;
    const you = { x: 0, y: 0 };

    const resize = () => {
      const rect = cvs.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      you.x = w > 900 ? w * 0.72 : w * 0.5;
      you.y = w > 900 ? h * 0.5 : h * 0.62;
      const count = Math.round(Math.min(110, (w * h) / 14000));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: i < TRACKERS.length ? 2.6 : 1 + Math.random() * 1.2,
        label: i < TRACKERS.length ? TRACKERS[i] : undefined,
        heat: 0,
      }));
    };

    const spawn = () => {
      const targets = nodes.filter((n) => n.label);
      const n = targets[Math.floor(Math.random() * targets.length)];
      if (!n) return;
      packets.push({ x: you.x, y: you.y, tx: n.x, ty: n.y, to: nodes.indexOf(n), speed: 1.6 + Math.random() * 1.6, alive: true });
    };

    const onMove = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = pointer.y > 0 && pointer.y < h;
    };
    const onLeave = () => (pointer.active = false);
    // phones have no hover: a tap drops the shield where your finger lands for a few seconds
    let tapTimer = 0;
    const onTap = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      onMove(e);
      clearTimeout(tapTimer);
      tapTimer = window.setTimeout(onLeave, 2600);
    };

    const frame = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // shield follows pointer, or orbits "you" when idle
      const sx = pointer.active ? pointer.x : you.x + Math.cos(t / 140) * 170;
      const sy = pointer.active ? pointer.y : you.y + Math.sin(t / 140) * 110;
      shield.x += (sx - shield.x) * 0.15;
      shield.y += (sy - shield.y) * 0.15;

      // edges
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(160,170,190,${(1 - d / 120) * 0.12})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const dx = n.x - shield.x,
          dy = n.y - shield.y,
          d = Math.hypot(dx, dy);
        if (d < shield.r + 30) {
          const f = (shield.r + 30 - d) / (shield.r + 30);
          n.vx += (dx / (d || 1)) * f * 0.9;
          n.vy += (dy / (d || 1)) * f * 0.9;
          n.heat = 1;
        }
        n.vx *= 0.94;
        n.vy *= 0.94;
        n.vx += (Math.random() - 0.5) * 0.03;
        n.vy += (Math.random() - 0.5) * 0.03;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
        n.heat *= 0.96;

        const col = n.label ? `rgba(255,51,102,${0.55 + n.heat * 0.45})` : `rgba(163,169,184,${0.35 + n.heat * 0.5})`;
        ctx.fillStyle = n.heat > 0.3 ? `rgba(0,242,254,${0.4 + n.heat * 0.6})` : col;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        if (n.label && w > 640) {
          ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = `rgba(255,51,102,${0.45 + n.heat * 0.3})`;
          ctx.fillText(n.label, n.x + 7, n.y + 3);
        }
      }

      // packets: you → trackers
      if (!reduce && t % 9 === 0) spawn();
      for (const p of packets) {
        if (!p.alive) continue;
        const target = nodes[p.to];
        if (target) {
          p.tx = target.x;
          p.ty = target.y;
        }
        const dx = p.tx - p.x,
          dy = p.ty - p.y,
          d = Math.hypot(dx, dy);
        if (d < 4) {
          p.alive = false;
          leaked++;
          if (target) target.heat = Math.max(target.heat, 0.25);
          continue;
        }
        p.x += (dx / d) * p.speed;
        p.y += (dy / d) * p.speed;
        if (Math.hypot(p.x - shield.x, p.y - shield.y) < shield.r) {
          p.alive = false;
          blocked++;
          for (let k = 0; k < 6; k++) sparks.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1 });
          continue;
        }
        ctx.fillStyle = "rgba(255,176,32,.95)";
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        ctx.strokeStyle = "rgba(255,176,32,.25)";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (dx / d) * 14, p.y - (dy / d) * 14);
        ctx.stroke();
      }
      for (let i = packets.length - 1; i >= 0; i--) if (!packets[i].alive) packets.splice(i, 1);

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.04;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(0,242,254,${s.life})`;
        ctx.fillRect(s.x, s.y, 2, 2);
      }

      // "you"
      const pulse = 1 + Math.sin(t / 20) * 0.15;
      const g = ctx.createRadialGradient(you.x, you.y, 0, you.x, you.y, 60 * pulse);
      g.addColorStop(0, "rgba(232,234,240,.35)");
      g.addColorStop(1, "rgba(232,234,240,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(you.x, you.y, 60 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8eaf0";
      ctx.beginPath();
      ctx.arc(you.x, you.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "rgba(232,234,240,.8)";
      ctx.fillText("YOU", you.x + 10, you.y - 8);

      // shield
      ctx.save();
      ctx.translate(shield.x, shield.y);
      ctx.rotate(t / 200);
      ctx.strokeStyle = "rgba(0,242,254,.55)";
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, shield.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(0,242,254,.18)";
      ctx.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = Math.cos(a) * (shield.r - 10),
          py = Math.sin(a) * (shield.r - 10);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      const sg = ctx.createRadialGradient(shield.x, shield.y, shield.r * 0.4, shield.x, shield.y, shield.r);
      sg.addColorStop(0, "rgba(0,242,254,0)");
      sg.addColorStop(1, "rgba(0,242,254,.06)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(shield.x, shield.y, shield.r, 0, Math.PI * 2);
      ctx.fill();

      if (onStats && t - lastReport > 15) {
        lastReport = t;
        onStats({ blocked, leaked });
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    shield.x = you.x;
    shield.y = you.y;
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    window.addEventListener("pointermove", onMove, { passive: true });
    cvs.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onTap, { passive: true });
    // pause when off-screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(cvs);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cvs.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onTap);
      clearTimeout(tapTimer);
    };
  }, [onStats]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
