// Save the platform's JS/wasm assets (visualiser source) for reverse engineering the replay format.
//   node tools/fetch_visualiser.js [url-path ...]   (default: /game/visualiser)
// Uses the saved session (.auth/state.json); assets land in tools/visualiser_src/.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const BASE = 'https://2026a.battlecode.co.uk';
const STATE = path.join(__dirname, '..', '.auth', 'state.json');
const OUT = path.join(__dirname, 'visualiser_src');
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BRAVE, headless: true });
  const context = await browser.newContext({ storageState: STATE });
  const page = await context.newPage();
  const saved = new Set();
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\.(js|wasm|mjs)(\?|$)/.test(url)) return;
    try {
      const body = await res.body();
      const name = path.basename(new URL(url).pathname);
      fs.writeFileSync(path.join(OUT, name), body); saved.add(name);
    } catch {}
  });
  const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/game/visualiser'];
  for (const p of paths) {
    try { await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 }); } catch (e) { console.log('goto', p, e.message); }
    await page.waitForTimeout(5000);
  }
  console.log('saved', [...saved].join(' '));
  await browser.close();
})();
