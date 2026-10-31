"use client";

/**
 * "The data ocean" — a raw WebGL1 fragment-shader field behind the hero mesh.
 * Domain-warped fbm currents converge on "you" (crimson heat = data being
 * pulled), the cursor shield glows cyan, faint hex cells scroll past and
 * glyph-like streaks drift toward the core. Ignites from black with a
 * scanline sweep, dollies in + darkens as the hero scrolls away.
 *
 * Perf: rendered at reduced resolution and CSS-upscaled, paused off-screen /
 * tab hidden, survives context loss, falls back to a CSS gradient.
 */

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;   // 0..1, y up
uniform float u_mouseOn;
uniform float u_scroll; // 0..1 hero scrolled out
uniform float u_intro;  // 0..1 ignition
uniform vec2 u_core;    // 0..1, y up — the visitor's node

const vec3 VOID = vec3(0.027, 0.031, 0.043);
const vec3 CRIMSON = vec3(1.0, 0.2, 0.4);
const vec3 CYAN = vec3(0.0, 0.949, 0.996);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// noise periodic in x (period n) — seamless around the core's angle
float noiseP(vec2 x, float n) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float i0 = mod(i.x, n);
  float i1 = mod(i.x + 1.0, n);
  float a = hash(vec2(i0, i.y));
  float b = hash(vec2(i1, i.y));
  float c = hash(vec2(i0, i.y + 1.0));
  float d = hash(vec2(i1, i.y + 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec2 toP(vec2 frag, float aspect, float zoom) {
  vec2 p = (frag - 0.5) * vec2(aspect, 1.0);
  p *= zoom;
  p.y += u_scroll * 0.18;
  return p;
}

// ridged log-polar currents flowing into the core
float currents(vec2 p, vec2 core, float t) {
  vec2 d = p - core;
  float rr = length(d) + 1e-4;
  float ang = atan(d.y, d.x) / 6.2831853 + 0.5; // 0..1
  float lr = log(rr);
  vec2 q = vec2(ang * 28.0, lr * 3.2 + t * 0.55);
  float n = noiseP(q, 28.0) * 0.65 + noiseP(q * vec2(2.0, 2.0) + 7.1, 56.0) * 0.35;
  float ridge = 1.0 - abs(n * 2.0 - 1.0);
  ridge = pow(ridge, 7.0);
  float near = exp(-rr * 1.7);
  return ridge * near;
}

float hexEdge(vec2 uv, out vec2 id) {
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  id = uv - gv;
  vec2 g = abs(gv);
  float e = max(dot(g, normalize(r)), g.x);
  return e; // 0 at centre .. 0.5 at edge
}

void main() {
  vec2 frag = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float t = u_time;
  float zoom = 1.0 - 0.38 * u_scroll; // camera dolly

  vec2 p = toP(frag, aspect, zoom);
  vec2 core = toP(u_core, aspect, zoom);
  vec2 mp = toP(u_mouse, aspect, zoom);

  // ---- volumetric, domain-warped fbm haze
  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t * 0.04)), fbm(p * 1.5 + vec2(5.2, 1.3) - t * 0.035));
  vec2 r = vec2(fbm(p * 1.9 + 3.2 * q + vec2(1.7, 9.2) + t * 0.06),
                fbm(p * 1.9 + 3.2 * q + vec2(8.3, 2.8) - t * 0.045));
  float f = fbm(p * 1.7 + 2.6 * r);
  float haze = smoothstep(0.35, 0.95, f);

  // ---- currents with chromatic edge fringe
  vec2 fromC = frag - 0.5;
  float edge = dot(fromC, fromC);
  vec2 ca = fromC * (0.006 + 0.03 * edge) * vec2(aspect, 1.0);
  vec2 wob = (r - 0.5) * 0.06;
  float cG = currents(p + wob, core, t);
  float cR = currents(p + wob + ca, core, t);
  float cB = currents(p + wob - ca, core, t);

  // ---- shield (cursor) — blocks the pull
  float md = length(p - mp);
  float shield = exp(-md * md * 26.0) * u_mouseOn;
  float rd = (md - 0.17) * 38.0;
  float ring = exp(-rd * rd) * u_mouseOn;
  float pull = 1.0 - 0.85 * shield;

  // ---- core glow
  float cd = length(p - core);
  float coreGlow = exp(-cd * 5.5) * 0.5 + exp(-cd * 22.0) * 0.6;

  // ---- hex cells scrolling, flickering when data passes
  vec2 hid;
  vec2 huv = p * 13.0 + vec2(t * 0.12, -t * 0.05);
  float he = hexEdge(huv, hid);
  float hexLine = smoothstep(0.43, 0.5, he);
  float flick = step(0.93, hash(hid + floor(t * 1.3)));
  float hexMask = 0.25 + haze * 0.9;
  float hexI = hexLine * 0.05 * hexMask + flick * (1.0 - smoothstep(0.0, 0.5, he)) * 0.06 * haze;

  // ---- glyph streaks drifting toward the core
  float rows = 64.0;
  float row = floor(frag.y * rows);
  float rs = hash(vec2(row, 3.7));
  float dir = sign(u_core.x - frag.x);
  float sx = frag.x * 2.2 * aspect - dir * t * (0.05 + rs * 0.18) + rs * 9.0;
  float seg = fract(sx);
  float lane = step(0.82, hash(vec2(row, floor(sx))));
  float glyph = step(0.45, hash(vec2(floor(frag.x * u_res.x / 3.0), row + floor(t * 6.0 * rs))));
  float yIn = fract(frag.y * rows);
  float thin = smoothstep(0.25, 0.4, yIn) * (1.0 - smoothstep(0.6, 0.75, yIn));
  float streak = lane * glyph * thin * smoothstep(0.0, 0.6, seg) * (1.0 - smoothstep(0.6, 1.0, seg));
  streak *= 0.05 + haze * 0.35;

  // ---- compose
  vec3 col = VOID;
  col += vec3(0.05, 0.06, 0.09) * haze * 0.9;                       // cold deep volume
  vec3 heat = vec3(cR, cG * 0.9, cB) * pull;
  col += CRIMSON * 0.55 * (0.35 + haze) * heat;
  col += vec3(cR * 0.12, 0.0, cB * 0.35) * pull;                     // fringe tint
  col += CRIMSON * coreGlow * 0.32 * pull;
  col += mix(vec3(0.5, 0.55, 0.7), CRIMSON, haze) * streak;
  col += vec3(0.35, 0.45, 0.6) * hexI;
  col += CYAN * (shield * (0.06 + 0.22 * haze) + ring * 0.16);
  col += CYAN * hexLine * shield * 0.12;

  // legibility: darker on the headline side
  col *= mix(0.32, 1.0, smoothstep(0.08, 0.7, frag.x));

  // vignette
  vec2 vv = (frag - 0.5) * vec2(1.05, 1.25);
  col *= smoothstep(1.0, 0.25, length(vv));

  // scroll: darken as the camera pushes in
  col = mix(VOID, col, 1.0 - 0.75 * u_scroll);

  // intro: ignite with a scanline sweep (top → bottom)
  float ys = 1.0 - u_intro * 1.25;
  float revealed = smoothstep(ys, ys + 0.12, frag.y);
  float line = exp(-abs(frag.y - ys) * 140.0) * (1.0 - u_intro);
  col = mix(VOID * 0.6, col, revealed * smoothstep(0.0, 0.35, u_intro));
  col += mix(CYAN, CRIMSON, frag.x) * line * 0.55;

  // grain
  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.018;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

type GLState = {
  prog: WebGLProgram;
  vs: WebGLShader;
  fs: WebGLShader;
  buf: WebGLBuffer;
  u: Record<string, WebGLUniformLocation | null>;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function init(gl: WebGLRenderingContext): GLState | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "a_pos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  const buf = gl.createBuffer();
  if (!buf) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  const names = ["u_res", "u_time", "u_mouse", "u_mouseOn", "u_scroll", "u_intro", "u_core"];
  const u: GLState["u"] = {};
  for (const n of names) u[n] = gl.getUniformLocation(prog, n);
  return { prog, vs, fs, buf, u };
}

const INTRO_MS = 2500;

export function ShaderField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const showFallback = () => {
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      cvs.style.opacity = "0";
    };

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = cvs.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      }) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }
    if (!gl) {
      showFallback();
      return;
    }
    const ctx = gl;
    let st = init(ctx);
    if (!st) {
      showFallback();
      return;
    }

    const section = cvs.parentElement ?? cvs;
    const start = performance.now();
    let raf = 0;
    let inView = true;
    let lost = false;
    let w = 0,
      h = 0,
      cssW = 1,
      cssH = 1;
    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5, on: 0, ton: 0 };
    let scroll = 0;

    const resize = () => {
      const rect = cvs.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      // ~0.5–0.75 of device pixels, and never more than ~1.1 MP
      let scale = dpr * (dpr > 1.5 ? 0.38 : 0.6);
      const mp = cssW * cssH * scale * scale;
      if (mp > 1.1e6) scale *= Math.sqrt(1.1e6 / mp);
      w = Math.max(1, Math.round(cssW * scale));
      h = Math.max(1, Math.round(cssH * scale));
      cvs.width = w;
      cvs.height = h;
    };

    const readScroll = () => {
      const r = section.getBoundingClientRect();
      scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    };

    const onMove = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      const x = (e.clientX - r.left) / Math.max(1, r.width);
      const y = (e.clientY - r.top) / Math.max(1, r.height);
      mouse.tx = x;
      mouse.ty = 1 - y;
      mouse.ton = x > 0 && x < 1 && y > 0 && y < 1 ? 1 : 0;
    };
    const onLeave = () => {
      mouse.ton = 0;
    };

    const draw = (now: number) => {
      if (!st || lost) return;
      const s = st;
      const intro = reduce ? 1 : Math.min(1, (now - start) / INTRO_MS);
      const introE = 1 - Math.pow(1 - intro, 3);
      const k = reduce ? 1 : 0.08;
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      mouse.on += (mouse.ton - mouse.on) * (reduce ? 1 : 0.05);
      const wide = cssW > 900;
      ctx.viewport(0, 0, w, h);
      ctx.uniform2f(s.u.u_res, w, h);
      ctx.uniform1f(s.u.u_time, reduce ? 12.0 : ((now - start) / 1000) % 1000);
      ctx.uniform2f(s.u.u_mouse, mouse.x, mouse.y);
      ctx.uniform1f(s.u.u_mouseOn, reduce ? 0 : mouse.on);
      ctx.uniform1f(s.u.u_scroll, scroll);
      ctx.uniform1f(s.u.u_intro, introE);
      ctx.uniform2f(s.u.u_core, wide ? 0.72 : 0.5, wide ? 0.5 : 0.38);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = 0;
      draw(now);
      schedule();
    };
    const schedule = () => {
      if (reduce || raf || lost || !inView || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // reduced motion: a single static frame, redrawn (rAF-coalesced) on resize/scroll
    const redrawOnce = () => {
      if (raf || lost || document.hidden) return;
      raf = requestAnimationFrame((now) => {
        raf = 0;
        draw(now);
      });
    };

    const onVis = () => (document.hidden ? stop() : reduce ? redrawOnce() : schedule());
    const onScroll = () => {
      readScroll();
      if (reduce) redrawOnce();
    };
    const onResize = () => {
      resize();
      readScroll();
      if (reduce) redrawOnce();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      st = null;
      stop();
    };
    const onRestored = () => {
      lost = false;
      st = init(ctx);
      if (!st) {
        showFallback();
        return;
      }
      resize();
      if (reduce) draw(performance.now());
      else schedule();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) schedule();
        else stop();
      },
      { rootMargin: "100px" },
    );
    io.observe(cvs);

    resize();
    readScroll();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    cvs.addEventListener("webglcontextlost", onLost);
    cvs.addEventListener("webglcontextrestored", onRestored);

    if (reduce) draw(performance.now());
    else schedule();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      cvs.removeEventListener("webglcontextlost", onLost);
      cvs.removeEventListener("webglcontextrestored", onRestored);
      if (st && !ctx.isContextLost()) {
        ctx.deleteBuffer(st.buf);
        ctx.detachShader(st.prog, st.vs);
        ctx.detachShader(st.prog, st.fs);
        ctx.deleteShader(st.vs);
        ctx.deleteShader(st.fs);
        ctx.deleteProgram(st.prog);
      }
      st = null;
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        ref={fallbackRef}
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0,
          background:
            "radial-gradient(ellipse 55% 60% at 72% 50%, rgba(255,51,102,.16), transparent 70%), radial-gradient(ellipse 35% 40% at 80% 70%, rgba(0,242,254,.07), transparent 70%), #07080B",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
