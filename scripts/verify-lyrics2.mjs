import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c) => (c ? "PASS" : "FAIL");
mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE, args: ["--hide-scrollbars"] });

for (const [label, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("http://127.0.0.1:5178/", { waitUntil: "load" });
  await sleep(2200);

  const total = await page.evaluate(() => document.querySelectorAll("#lyrics p").length);
  console.log(`\n===== ${label} (${w}x${h}) 共 ${total} 行 =====`);

  const geom = await page.evaluate(() => {
    const el = document.getElementById("lyrics");
    return { top: el.offsetTop, h: el.offsetHeight, vh: window.innerHeight };
  });
  console.log(`轨道高度 ${geom.h}px (${(geom.h / geom.vh).toFixed(1)} 屏)`);

  // 焦点落在两行之间时，最亮的行最多偏移「半个行距」，这是设计使然
  const halfSlot = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#lyrics p")];
    const a = rows[0].getBoundingClientRect();
    const b = rows[1].getBoundingClientRect();
    return Math.abs(b.top - a.top) / 2 + 6;
  });
  console.log(`  允许的最大居中偏移（半个行距+容差）: ${Math.round(halfSlot)}px`);

  const failures = [];
  const sample = [0, 0.25, 0.5, 0.75, 1];
  for (let step = 0; step <= 40; step++) {
    const f = step / 40;
    const y = geom.top + Math.max(0, geom.h - geom.vh) * f;
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(140);

    const st = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("#lyrics p")];
      // p 的直接父级才是承载 opacity/y 的 motion.div
      const opOf = (p) => parseFloat(getComputedStyle(p.parentElement).opacity);
      let best = { i: -1, o: -1 };
      rows.forEach((p, i) => {
        const o = opOf(p);
        if (o > best.o) best = { i, o };
      });
      const el = rows[best.i];
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      return {
        i: best.i,
        o: best.o,
        text: el.innerText.trim(),
        centerOffset: Math.round(r.top + r.height / 2 - mid),
        inView: r.top > -4 && r.bottom < window.innerHeight + 4,
      };
    });

    if (st.o < 0.75 || !st.inView || Math.abs(st.centerOffset) > halfSlot) {
      failures.push({ f: f.toFixed(2), ...st });
    }
    if (sample.some((s) => Math.abs(s - f) < 0.013)) {
      console.log(
        `  f=${f.toFixed(2)} 行#${st.i} op=${st.o.toFixed(2)} 居中偏差=${st.centerOffset}px 在视口内=${st.inView} | ${st.text}`,
      );
    }
  }

  const visited = new Set();
  for (let step = 0; step <= 60; step++) {
    const f = step / 60;
    await page.evaluate((v) => window.scrollTo(0, v), geom.top + Math.max(0, geom.h - geom.vh) * f);
    await sleep(110);
    const i = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("#lyrics p")];
      let best = { i: -1, o: -1 };
      rows.forEach((p, k) => {
        const o = parseFloat(getComputedStyle(p.parentElement).opacity);
        if (o > best.o) best = { i: k, o };
      });
      return best.i;
    });
    visited.add(i);
  }

  console.log(`\n  21 行全部成为过焦点: ${ok(visited.size >= total)} (${visited.size}/${total})`);
  console.log(`  焦点行始终居中且在视口内: ${ok(failures.length === 0)} (异常 ${failures.length} 次)`);
  if (failures.length) failures.slice(0, 5).forEach((f) => console.log(`    ! ${JSON.stringify(f)}`));

  for (const [name, f] of [["start", 0.02], ["mid", 0.5], ["end", 0.98]]) {
    await page.evaluate((v) => window.scrollTo(0, v), geom.top + Math.max(0, geom.h - geom.vh) * f);
    await sleep(900);
    await page.screenshot({ path: `shots/${label}-lyrics-${name}.png` });
  }

  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`  横向溢出: ${ov}px | JS 错误: ${errs.length ? errs.join(" | ") : "无"}`);
  await page.close();
}

await browser.close();
