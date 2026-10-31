// full scroll audit: node audit.mjs <base> [widths]
import { chromium } from "playwright";
const [, , base = "http://localhost:3100", ws = "375,1440,2000"] = process.argv;
const routes = ["/", "/audit", "/vault", "/economics", "/defense", "/legal", "/tools"];
const sizes = { 375: 812, 768: 1024, 1440: 900, 2000: 806 };
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const report = [];
for (const W of ws.split(",").map(Number)) {
  const ctx = await b.newContext({ viewport: { width: W, height: sizes[W] ?? 900 }, hasTouch: false });
  await ctx.addInitScript(() => sessionStorage.setItem("kyd.intro.v1", "1"));
  for (const r of routes) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
    await p.goto(base + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    await p.mouse.move(W / 2, 300);
    const hidden = new Map();
    let steps = 0, stuck = 0, last = -1;
    while (steps < 400) {
      await p.mouse.wheel(0, 360);
      await p.waitForTimeout(140);
      steps++;
      const st = await p.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight }));
      if (steps % 4 === 0) {
        await p.waitForTimeout(900);
        const bad = await p.evaluate(() => {
          const out = [];
          const sel = "h1,h2,h3,h4,p,li,button,a,td,th,label,[data-check]";
          for (const e of document.querySelectorAll(sel)) {
            const t = (e.innerText || "").trim();
            if (!t || e.closest("[aria-hidden=true],#kyd-intro,.sr-only")) continue;
            const rc = e.getBoundingClientRect();
            if (rc.height < 4 || rc.top < 80 || rc.bottom > innerHeight - 20) continue;
            let op = 1, n = e;
            while (n && n !== document.body) { const cs = getComputedStyle(n); op *= +cs.opacity; if (cs.visibility === "hidden") op = 0; n = n.parentElement; }
            if (op < 0.15) out.push(`${e.tagName} "${t.slice(0, 40)}" op=${op.toFixed(2)}`);
          }
          return out;
        });
        for (const x of bad) hidden.set(x, (hidden.get(x) || 0) + 1);
      }
      if (st.y >= st.max - 2) break;
      stuck = st.y === last ? stuck + 1 : 0; last = st.y;
      if (stuck > 12) break;
    }
    // pages like /audit grow as live results land — give the bottom a final nudge before measuring
    for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, 600); await p.waitForTimeout(150); }
    await p.waitForTimeout(1500);
    const end = await p.evaluate(() => {
      const fixedBad = [];
      for (const e of document.querySelectorAll("[class*='fixed']")) {
        const cs = getComputedStyle(e);
        if (/\bfixed\b/.test(e.className.baseVal ?? e.className) && cs.position !== "fixed" && cs.display !== "none") fixedBad.push(e.className.slice(0, 50));
      }
      const f = document.querySelector("footer").getBoundingClientRect();
      const mark = document.querySelector("footer [aria-hidden] span");
      return { y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight, gapBelowFooter: Math.round(innerHeight - f.bottom),
        overflowX: document.documentElement.scrollWidth - innerWidth, fixedBad,
        markFits: mark ? Math.round(mark.getBoundingClientRect().right) <= innerWidth : null };
    });
    
    report.push({ W, r, steps, ...end, hidden: [...hidden.keys()].slice(0, 8), errs: errs.slice(0, 3) });
    console.log(JSON.stringify(report.at(-1)));
    await p.close();
  }
  await ctx.close();
}
await b.close();
