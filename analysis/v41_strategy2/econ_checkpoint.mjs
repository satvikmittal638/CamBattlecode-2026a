// Matched-round checkpoint (rounds 300/600/900): per team, mean per alive champion of item gold spent
// (from actual inventory: 30/shard, 150/emblem) and unspent gold; lanes vs other maps separated.
//   node analysis/v41_strategy2/econ_checkpoint.mjs <q_core output json> <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
const [qjson, idxFile] = process.argv.slice(2);
const files = JSON.parse(fs.readFileSync(qjson, 'utf8')).files; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const work = files.map((f) => { const x = idx.find((y) => y.file === f); return { path: path.join(path.dirname(idxFile), f), side: x.side, map: x.map, result: x.result }; });
const src = `const { parentPort, workerData } = require('node:worker_threads');
(async () => { const { dumpReplay } = await import('/Users/dmitt/Desktop/CamBattlecode/tools/replay_dump.mjs');
 for (const g of workerData) { const us = g.side === 'a' ? 0 : 1; const out = { map: g.map, result: g.result, ck: {} }; let last = -1;
  await dumpReplay(g.path, { snapshots: 'none', onStep(x) { if (x.round === last) return; last = x.round; if (![300, 600, 900].includes(x.round)) return;
   const t = (team) => { const C = x.champions.filter((c) => c.team === team && c.alive); const spent = C.map((c) => c.items.reduce((s, n, i) => s + n * (i % 2 ? 150 : 30), 0)); return { n: C.length, spent: spent.reduce((a, b) => a + b, 0), gold: C.reduce((s, c) => s + c.gold, 0) }; };
   out.ck[x.round] = { us: t(us), them: t(1 - us) }; } });
  parentPort.postMessage(out); } })();`;
const res = []; let bad = 0; const jobs = 4;
await Promise.all(Array.from({ length: jobs }, (_, j) => new Promise((r) => { const w = new Worker(src, { eval: true, workerData: work.filter((_, i) => i % jobs === j) }); w.on('message', (m) => res.push(m)); w.on('error', () => bad++); w.on('exit', (c) => { if (c) bad++; r(); }); })));
console.log(`${qjson}: games ${work.length}, results ${res.length}, worker problems ${bad}`);
for (const grp of ['lanes', 'other maps']) for (const R of [300, 600, 900]) { const G = res.filter((r) => (grp === 'lanes') === (r.map === '00lanes') && r.ck[R]);
  const m = (s, k) => { const n = G.reduce((a, g) => a + g.ck[R][s].n, 0); return n ? (G.reduce((a, g) => a + g.ck[R][s][k], 0) / n).toFixed(0) : '-'; };
  console.log(`  ${grp.padEnd(10)} r${R} games ${String(G.length).padStart(2)} | per alive champion: us spent ${m('us', 'spent')}g unspent ${m('us', 'gold')}g | them spent ${m('them', 'spent')}g unspent ${m('them', 'gold')}g`); }
