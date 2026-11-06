// Download the official handbook Markdown exports and render every handbook page.
//   node tools/scrape_docs.js <outDir>
// Writes <outDir>/official/{GameRules.md,BotAPI*.md} and <outDir>/pages/*.md.
// Language-specific guide pages are rendered once per SDK language.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = 'https://2026a.battlecode.co.uk';
const OUT = process.argv[2];
const LANGS = ['cpp', 'python', 'rust', 'ocaml'];
const API_FILES = { cpp: 'BotAPICpp.md', rust: 'BotAPIRust.md', python: 'BotAPIPython.md', ocaml: 'BotAPIOCaml.md' };
const TD = require.resolve('turndown/lib/turndown.browser.umd.js');
const GFM = require.resolve('turndown-plugin-gfm/dist/turndown-plugin-gfm.js');
if (!OUT) { console.error('usage: scrape_docs.js <outDir>'); process.exit(2); }
fs.mkdirSync(path.join(OUT, 'official'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });

async function render(page, url, lang) {
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate((l) => localStorage.setItem('cambc.handbook.language', l), lang);
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => (d.open = true));
      (document.querySelector('main') || document.body).querySelectorAll('button[aria-expanded="false"]').forEach((b) => b.click());
    });
    await page.waitForTimeout(150);
  }
  await page.addScriptTag({ path: TD });
  await page.addScriptTag({ path: GFM });
  return page.evaluate(() => {
    const root = document.querySelector('main') || document.body;
    const clone = root.cloneNode(true);
    clone.querySelectorAll('nav, script, style, svg, canvas, select, input').forEach((n) => n.remove());
    clone.querySelectorAll('img[src^="data:"]').forEach((n) => n.remove());
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    td.use(turndownPluginGfm.gfm);
    return td.turndown(clone.innerHTML);
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.goto(BASE + '/game/docs/agents', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const grab = async (label) => {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click(`button[aria-label="Download ${label}"]`)]);
    await dl.saveAs(path.join(OUT, 'official', dl.suggestedFilename()));
    console.log('downloaded', dl.suggestedFilename());
  };
  await grab('GameRules.md');
  for (const lang of LANGS) {
    await page.selectOption('select[aria-label="Bot API language"]', lang);
    await page.waitForTimeout(300);
    await grab(API_FILES[lang]);
  }

  // Discover pages from the handbook home and the champion roster.
  const links = new Set();
  for (const u of ['/game/docs', '/game/docs/champions']) {
    await page.goto(BASE + u, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelectorAll('button[aria-expanded="false"]').forEach((b) => b.click()));
    await page.waitForTimeout(300);
    for (const h of await page.evaluate(() => [...document.querySelectorAll('a[href^="/game/docs"]')].map((a) => a.getAttribute('href').split('#')[0]))) links.add(h);
  }
  links.delete('/game/docs/agents');
  const urls = [...links, '/game/download', '/game/patch-notes'];
  console.log('pages:', urls.length);

  for (const url of urls) {
    const slug = url.replace(/^\/game\/?/, '').replace(/\//g, '_') || 'game';
    const variants = new Map();
    for (const lang of LANGS) {
      let md;
      try { md = await render(page, url, lang); } catch (e) { console.log('FAILED', url, lang, e.message); continue; }
      if (![...variants.values()].includes(md)) variants.set(lang, md);
      if (lang === 'cpp' && !/first-bot|bitboards|distance-fields|vscode|shared-memory|fuel/.test(url)) break;
    }
    const multi = variants.size > 1;
    for (const [lang, md] of variants) {
      const name = multi ? `${slug}.${lang}.md` : `${slug}.md`;
      fs.writeFileSync(path.join(OUT, 'pages', name), `<!-- source: ${BASE}${url} (language: ${lang}) -->\n\n${md}\n`);
    }
    console.log(url, variants.size);
  }
  await browser.close();
})();
