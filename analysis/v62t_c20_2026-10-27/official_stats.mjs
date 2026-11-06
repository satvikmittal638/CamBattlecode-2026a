// Official engine match summaries for every collected game: GET /matches/<id>/summary gives a link to the binary
// CAMSTAT file; `cambc summary` (CLI 4.0.0) converts it locally. Keeps everything except the large per-champion
// timelines. Writes official_summaries/<matchId>.json; resumable; loops until the collector is done.
//   node official_stats.mjs
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import { get, sleep } from './http.mjs';
const dir = import.meta.dirname, out = dir + '/official_summaries', tmp = dir + '/official_summaries/tmp';
fs.mkdirSync(tmp, { recursive: true });
const CLI = dir + '/../../.venv/bin/cambc';
for (;;) {
  const index = fs.existsSync(dir + '/games/index.json') ? JSON.parse(fs.readFileSync(dir + '/games/index.json')) : [];
  let wrote = 0, failed = 0;
  for (const g of index) {
    const target = `${out}/${g.matchId}.json`;
    if (fs.existsSync(target)) continue;
    try {
      const meta = await get('/matches/' + g.matchId + '/summary');
      const url = meta.url || meta.downloadUrl;
      if (!url) throw Error('no summary url ' + JSON.stringify(meta).slice(0, 200));
      const r = await fetch(new URL(url, 'https://2026a.battlecode.co.uk').href, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw Error('summary HTTP ' + r.status);
      const bin = `${tmp}/${g.matchId}.bin`;
      fs.writeFileSync(bin, Buffer.from(await r.arrayBuffer()));
      const json = JSON.parse(execFileSync(CLI, ['summary', bin], { maxBuffer: 1 << 28 }).toString());
      delete json.championTimelines; delete json.heatmaps;
      fs.writeFileSync(target, JSON.stringify(json));
      fs.rmSync(bin);
      wrote++;
    } catch (e) { failed++; if (failed < 5) console.log('fail', g.matchId, e.message.slice(0, 200)); }
    await sleep(300);
  }
  const done = fs.existsSync(dir + '/collection_done.json');
  console.log(new Date().toISOString(), `summaries ${fs.readdirSync(out).filter((f) => f.endsWith('.json')).length}/${index.length}, wrote ${wrote}, failed ${failed}`);
  if (done && !failed && fs.readdirSync(out).filter((f) => f.endsWith('.json')).length >= index.length) break;
  await sleep(60000);
}
