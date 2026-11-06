// Render one patch-note article (or any site page) to Markdown with the same Playwright/Turndown/GFM workflow as
// scrape_docs.js.   node tools/fetch_patch_note.js /game/patch-notes/<id> <out.md>
const { chromium } = require('playwright-core');
const fs = require('fs');
const BASE = 'https://2026a.battlecode.co.uk';
const [url, out] = process.argv.slice(2);
if (!url || !out) { console.error('usage: fetch_patch_note.js <path> <out.md>'); process.exit(2); }
const TD = require.resolve('turndown/lib/turndown.browser.umd.js');
const GFM = require.resolve('turndown-plugin-gfm/dist/turndown-plugin-gfm.js');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  const page = await browser.newPage();
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.addScriptTag({ path: TD });
  await page.addScriptTag({ path: GFM });
  const md = await page.evaluate(() => {
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    td.use(turndownPluginGfm.gfm);
    return td.turndown((document.querySelector('main') || document.body).innerHTML);
  });
  fs.writeFileSync(out, `<!-- source: ${BASE}${url} fetched ${new Date().toISOString()} -->\n\n${md}\n`);
  await browser.close();
  console.log(out, md.length);
})();
