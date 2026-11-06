#!/usr/bin/env node
// Kill conversion per side: an episode starts when a living champion drops below 25% of max HP
// (not on its own spawn); it ends as "died" if the champion dies within 10 rounds, else "escaped".
// Reports, per game set, how often OUR low champions escape and how often THEIR low champions
// escape (i.e. our finishing rate), plus the share of episodes where the low champion recalled.
//   node tools/finish_rate.mjs <index.json> [--maps re] [--jobs 6]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay } from './replay_dump.mjs';
const SELF = fileURLToPath(import.meta.url);
async function one(file, us) {
  const ep = new Map(); const res = { us: { died: 0, escaped: 0, recalled: 0 }, them: { died: 0, escaped: 0, recalled: 0 } };
  let last = -1; const recalled = new Set();
  await dumpReplay(file, { snapshots: 'none', onStep(st, ev) {
    if (ev && ev.kind === 'Recall' && ev.actor?.kind === 1) recalled.add(ev.actor.index);
    if (st.round === last) return; last = st.round;
    for (const c of st.champions) {
      const side = c.team === us ? 'us' : 'them'; const e = ep.get(c.entity.index);
      if (e) {
        if (!c.alive) { res[side].died++; ep.delete(c.entity.index); continue; }
        if (st.round - e.start > 10) { res[side].escaped++; if (recalled.has(c.entity.index)) res[side].recalled++; ep.delete(c.entity.index); }
        continue;
      }
      if (c.alive && c.health < 0.25 * c.maxHealth) { ep.set(c.entity.index, { start: st.round }); recalled.delete(c.entity.index); }
    }
  } });
  return res;
}
if (isMainThread) {
  const args = process.argv.slice(2); const opt = (k, d) => { const j = args.indexOf('--' + k); return j >= 0 ? args[j + 1] : d; };
  const re = new RegExp(opt('maps', '.')); const jobs = +opt('jobs', Math.max(1, os.cpus().length - 2));
  const rows = args.filter((a) => a.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).filter((x) => re.test(x.map)).map((x) => ({ path: path.join(path.dirname(f), x.file), us: x.side === 'a' ? 0 : 1 })));
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, k) => k % jobs === j)); const T = { us: { died: 0, escaped: 0, recalled: 0 }, them: { died: 0, escaped: 0, recalled: 0 } };
  await Promise.all(chunks.map((c) => new Promise((res) => { const w = new Worker(SELF, { workerData: c }); w.on('message', (m) => { for (const s of ['us', 'them']) for (const k in m[s]) T[s][k] += m[s][k]; }); w.on('exit', res); })));
  const n = rows.length;
  for (const s of ['us', 'them']) { const t = T[s]; const tot = t.died + t.escaped; console.log(`${s === 'us' ? 'our low champions ' : 'their low champions'}: ${(tot / n).toFixed(1)}/game, died ${(100 * t.died / tot).toFixed(0)}%, escaped ${(100 * t.escaped / tot).toFixed(0)}% (recall used in ${(100 * t.recalled / Math.max(1, t.escaped)).toFixed(0)}% of escapes)`); }
} else { for (const r of workerData) { try { parentPort.postMessage(await one(r.path, r.us)); } catch (e) {} } }
