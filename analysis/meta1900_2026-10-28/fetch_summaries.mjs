// Official engine summaries (CAMSTAT -> JSON via `cambc summary`) for every game in teams/*/index.json and
// ours/index.json-referenced folders. Resumable; paced for the 30 requests/minute read budget.
//   node fetch_summaries.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { api, sleep } from '../../tools/bclib.mjs';
const dir = import.meta.dirname, out = dir + '/summaries', tmp = out + '/tmp', CLI = dir + '/../../.venv/bin/cambc';
fs.mkdirSync(tmp, { recursive: true });
const ids = new Set();
for (const t of fs.readdirSync(dir + '/teams')) {
  const f = `${dir}/teams/${t}/index.json`; if (!fs.existsSync(f)) continue;
  for (const r of JSON.parse(fs.readFileSync(f, 'utf8'))) ids.add(r.matchId);
}
let done = 0, failed = 0;
for (const id of ids) {
  const target = `${out}/${id}.json`; if (fs.existsSync(target)) continue;
  try {
    const meta = await api('GET', '/matches/' + id + '/summary'); const url = meta.url || meta.downloadUrl;
    const r = await fetch(new URL(url, 'https://2026a.battlecode.co.uk').href, { signal: AbortSignal.timeout(60000) });
    const bin = `${tmp}/${id}.bin`; fs.writeFileSync(bin, Buffer.from(await r.arrayBuffer()));
    const json = JSON.parse(execFileSync(CLI, ['summary', bin], { maxBuffer: 1 << 28 }).toString());
    delete json.championTimelines; delete json.heatmaps; fs.writeFileSync(target, JSON.stringify(json)); fs.rmSync(bin); done++;
  } catch (e) { failed++; if (failed < 5) console.log('fail', id, e.message.slice(0, 120)); await sleep(5000); }
  await sleep(2100);
}
console.log(new Date().toISOString(), 'summaries written', done, 'failed', failed, 'of', ids.size);
