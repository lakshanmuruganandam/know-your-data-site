// end-to-end function tests: node func.mjs <base> <desktop|phone>
import { chromium, devices } from "playwright";
const [, , base = "http://localhost:3100", mode = "desktop"] = process.argv;
const phone = mode === "phone";
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const { defaultBrowserType, ...iphone } = devices["iPhone 14"];
const ctx = await b.newContext(phone ? { ...iphone, acceptDownloads: true } : { viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
await ctx.addInitScript(() => sessionStorage.setItem("kyd.intro.v1", "1"));
const results = [];
const errs = [];
const ok = (name, cond, info = "") => { results.push([cond ? "PASS" : "FAIL", name, info]); console.log(cond ? "PASS" : "FAIL", name, info); };
const press = (loc) => (phone ? loc.tap() : loc.click());
const price = async (p) => +(await p.locator("nav").getByText(/\$\d+\.\d\d/).first().innerText()).replace(/[^0-9.]/g, "");
async function open(path) {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(path + " " + String(e).slice(0, 160)));
  p.on("console", (m) => m.type() === "error" && errs.push(path + " " + m.text().slice(0, 160)));
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  return p;
}
const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, "threw: " + String(e).split("\n")[0].slice(0, 160)); } };

// ── AUDIT
await step("audit", async () => {
  const p = await open("/audit");
  await p.waitForTimeout(6000);
  const txt = await p.locator("main").innerText();
  ok("audit: scan finishes", !/SCANNING/.test(await p.locator("main button").first().innerText()), (await p.locator("main button").first().innerText()).slice(0, 30));
  const st = await p.evaluate(() => [...document.querySelectorAll("main svg[aria-label]")].map((s) => s.getAttribute("aria-label")));
  ok("audit: every check has a verdict", st.filter((s) => /pass|warn|fail/.test(s)).length >= 7, st.join(","));
  ok("audit: no check stuck scanning", !st.includes("scan"), "");
  const before = (await p.locator("main").innerText()).length;
  await press(p.getByRole("button", { name: /Canvas fingerprint/ }));
  await p.waitForTimeout(700);
  ok("audit: check expands with detail", (await p.locator("main").innerText()).length > before, "");
  ok("audit: shows a score", /\d+\s*\/\s*100|\d+%|score/i.test(txt), "");
  await p.close();
});

// ── VAULT
await step("vault", async () => {
  const p = await open("/vault");
  const files = () => p.getByRole("button", { name: /^Open file/ }).count();
  ok("vault: 10 files listed", (await files()) === 10, String(await files()));
  await press(p.locator("main button", { hasText: /^\s*breach/i }).first());
  await p.waitForTimeout(900);
  ok("vault: BREACH filter → 3", (await files()) === 3, String(await files()));
  await press(p.locator("main button", { hasText: /^\s*all files/i }).first());
  await p.waitForTimeout(900);
  const order1 = await p.getByRole("button", { name: /^Open file/ }).first().getAttribute("aria-label");
  await press(p.locator("main button", { hasText: /^\s*chronology/i }).first());
  await p.waitForTimeout(900);
  const order2 = await p.getByRole("button", { name: /^Open file/ }).first().getAttribute("aria-label");
  ok("vault: sort changes order", order1 !== order2, `${order1?.slice(10, 30)} → ${order2?.slice(10, 30)}`);
  await press(p.getByRole("button", { name: /^Open file/ }).first());
  await p.waitForTimeout(1500);
  const dlg = p.getByRole("dialog");
  ok("vault: dossier opens", (await dlg.count()) > 0 && (await dlg.first().isVisible()), "");
  const dt = (await dlg.first().innerText()).length;
  ok("vault: dossier has content", dt > 400, dt + " chars");
  if (phone) { const bb = await dlg.first().boundingBox(); ok("vault: dossier fits phone", bb && bb.width <= 391, JSON.stringify(bb)); }
  await p.keyboard.press("Escape");
  await p.waitForTimeout(900);
  ok("vault: dossier closes", (await dlg.count()) === 0 || !(await dlg.first().isVisible()), "");
  await p.close();
});

// ── ECONOMICS
await step("economics", async () => {
  const p = await open("/economics");
  const main = () => p.locator("main").innerText();
  const t0 = await main();
  await press(p.getByRole("button", { name: /^SMALL STARTUP/i }));
  await p.waitForTimeout(1200);
  const t1 = await main();
  ok("econ: preset changes the model", t0 !== t1, "");
  const r = p.locator("main input[type=range]").first();
  const v0 = await r.inputValue();
  await r.focus();
  for (let i = 0; i < 15; i++) await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(1200);
  ok("econ: slider moves & recomputes", (await r.inputValue()) !== v0 && (await main()) !== t1, `${v0}→${await r.inputValue()}`);
  await press(p.locator("main button", { hasText: /^\s*net income/i }).first());
  await p.waitForTimeout(800);
  ok("econ: revenue/net-income toggle", (await main()) !== t1, "");
  const run = p.getByRole("button", { name: /^RUN$/i });
  await run.scrollIntoViewIfNeeded();
  await press(run);
  await p.waitForTimeout(6000);
  const at = await main();
  ok("econ: auction runs to a winner", /win|cleared|sold|winner/i.test(at), "");
  await p.close();
});

// ── DEFENSE + shadow profile price
await step("defense", async () => {
  const p = await open("/defense");
  const p0 = await price(p);
  // step 2 ("Fix your browser") holds tasks that redact profile fields
  await press(p.locator("main button", { hasText: /^\s*STEP 2/i }).first());
  await p.waitForTimeout(900);
  const cb = p.locator("main label:has(input[type=checkbox])", { hasText: "▸" }).first();
  await cb.scrollIntoViewIfNeeded();
  await press(cb);
  await p.waitForTimeout(1500);
  const p1 = await price(p);
  ok("defense: ticking a task lowers your price", p1 < p0, `$${p0} → $${p1}`);
  const mk = p.getByRole("button", { name: "Mark all of step 1 done" });
  await mk.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  try { await press(mk); } catch (e) { const box = await p.evaluate(() => { const b = document.querySelector("[aria-label='Mark all of step 1 done']"); const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.x + 20, r.y + 20); return t?.outerHTML.slice(0, 220); }); console.log("covered by:", box); throw e; }
  await p.waitForTimeout(1200);
  ok("defense: mark step done → 4/4", /4\/4/.test(await p.locator("main").innerText()), "");
  const p2 = await price(p);
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  ok("defense: progress persists on reload", /4\/4/.test(await p.locator("main").innerText()) && (await price(p)) === p2, `$${await price(p)}`);
  await press(p.getByRole("button", { name: /^RESET$/i }));
  await p.waitForTimeout(1500);
  ok("defense: reset restores", !/[1-9]\/4/.test(await p.locator("main").innerText().then((t) => t.split("STEP 2")[0])) && (await price(p)) === p0, `$${await price(p)}`);
  await press(p.locator("main button", { hasText: /L2\s*Network/i }).first());
  await p.waitForTimeout(900);
  ok("defense: layer tab switches", /DNS|VPN|WireGuard|network/i.test(await p.locator("main").innerText()), "");
  await p.close();
});

// ── LEGAL
await step("legal", async () => {
  const p = await open("/legal");
  await p.getByPlaceholder("Aisha Al Mansoori").fill("Test Person");
  await p.getByPlaceholder("you@example.com").fill("test@example.com");
  await p.getByPlaceholder("e.g. a delivery app").fill("Acme Delivery");
  await p.waitForTimeout(700);
  const t = await p.locator("main").innerText();
  ok("legal: letter uses your details", t.includes("Test Person") && t.includes("Acme Delivery"), "");
  await press(p.getByRole("button", { name: /^GDPR$/i }));
  await p.waitForTimeout(700);
  ok("legal: GDPR switches law", /Article 15|GDPR|2016\/679/.test(await p.locator("main").innerText()), "");
  await press(p.getByRole("button", { name: /^COPY LETTER$/i }));
  await p.waitForTimeout(800);
  const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  ok("legal: copy puts letter on clipboard", clip.includes("Test Person") && clip.length > 300, clip.length + " chars");
  const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 5000 }), press(p.getByRole("button", { name: /DOWNLOAD \.TXT/i }))]);
  const path = await dl.path();
  const fs = await import("fs");
  const body = fs.readFileSync(path, "utf8");
  ok("legal: download .txt", dl.suggestedFilename().endsWith(".txt") && body.includes("Test Person"), dl.suggestedFilename());
  await p.close();
});

// ── TOOLS
await step("tools", async () => {
  const p = await open("/tools");
  const s = p.getByPlaceholder(/Search: gmail/);
  await s.fill("signal");
  await p.waitForTimeout(900);
  const adds = await p.getByRole("button", { name: /^Add .* to my stack/ }).allInnerTexts().catch(() => []);
  const names = await p.getByRole("button", { name: /^Add .* to my stack/ }).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  ok("tools: search finds Signal", names.some((n) => /Signal/.test(n)), names.slice(0, 3).join(" | "));
  await s.fill("");
  await p.waitForTimeout(600);
  await press(p.getByRole("button", { name: /^DNS\s*5$/i }));
  await p.waitForTimeout(900);
  const n = await p.getByRole("button", { name: /^Add .* to my stack/ }).count();
  ok("tools: DNS category → 5", n === 5, String(n));
  const before = await p.locator("main").innerText();
  await press(p.getByRole("button", { name: /^Add .* to my stack/ }).first());
  await p.waitForTimeout(900);
  ok("tools: add to my stack updates", (await p.locator("main").innerText()) !== before, "");
  await press(p.getByRole("button", { name: /Replace WhatsApp/ }));
  await p.waitForTimeout(900);
  const m = await p.getByRole("button", { name: /^Add .* to my stack as Messaging/ }).count();
  ok("tools: swap matrix jumps to Messaging", m >= 3, String(m));
  await p.close();
});

// ── SHADOW DOCK + NAV
await step("dock", async () => {
  const p = await open("/");
  const p0 = await price(p);
  await press(p.locator("nav").getByText(/\$\d+\.\d\d/).first());
  await p.waitForTimeout(1000);
  const dock = p.getByRole("dialog").or(p.locator("[aria-label='Your shadow profile']"));
  ok("dock: opens from price pill", await dock.first().isVisible(), "");
  const sw = dock.first().locator("button").filter({ hasText: /redact|timezone|language|screen/i });
  const cnt = await sw.count();
  if (cnt) { await press(sw.first()); await p.waitForTimeout(900); }
  ok("dock: redacting a field lowers price", cnt > 0 && (await price(p)) < p0, `${cnt} toggles, $${p0} → $${await price(p)}`);
  if (phone) await press(dock.first().getByRole("button", { name: "Close" }));
  else await p.keyboard.press("Escape");
  await p.waitForTimeout(900);
  ok("dock: closes", !(await dock.first().isVisible().catch(() => false)), "");
  if (phone) {
    await press(p.getByRole("button", { name: "Open menu" }));
    await p.waitForTimeout(700);
    await press(p.locator("div.fixed a[href='/vault']").first());
    await p.waitForURL(/\/vault/, { timeout: 5000 });
    ok("phone: menu navigates", p.url().endsWith("/vault"), p.url());
  }
  await p.close();
});

// ── GHOST LENS on phone (scope mode)
if (phone) await step("lens", async () => {
  const p = await open("/");
  const lensBtn = p.getByRole("button", { name: "Toggle the ghost lens" });
  ok("phone: lens off by default", (await lensBtn.getAttribute("aria-pressed")) === "false", "");
  await press(lensBtn); await p.waitForTimeout(800);
  const h = p.getByLabel("Drag the ghost lens");
  ok("phone: lens opens as scope", await h.isVisible(), "");
  const bb0 = await h.boundingBox();
  // drag with touch via CDP
  const cdp = await ctx.newCDPSession(p);
  const sx = bb0.x + bb0.width / 2, sy = bb0.y + bb0.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: sx, y: sy }] });
  for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: sx - i * 12, y: sy - i * 18 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(800);
  const bb1 = await h.boundingBox();
  ok("phone: scope drags with finger", Math.abs(bb1.y - bb0.y) > 60, `${Math.round(bb0.y)} → ${Math.round(bb1.y)}`);
  await p.mouse.wheel(0, 900); await p.waitForTimeout(1000);
  
  await p.close();
});

console.log("\nconsole/page errors:", errs.length ? errs : "none");
console.log(`${results.filter((r) => r[0] === "PASS").length}/${results.length} passed (${mode})`);
await b.close();
