// Stage mix and simple time-use for a trace build in live rollouts from round 1.
//   node stage_trace.mjs <trace wasm> <index.json> [--to 150] [--every 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const [wasm, idxFile] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const TO = +opt('to', 150), every = +opt('every', 4);
const ROOT = path.resolve(import.meta.dirname, '../..');
const exe = path.join(ROOT, 'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost');
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((_, i) => i % every === 0);
const st = {}; let n = 0, onSpawn = 0, dead = 0, act = { camp: 0, champ: 0, move: 0, none: 0 };
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1;
  const mp = path.join(ROOT, 'workspace/maps', g.map.replace(/_/g, '-') + '.map26a');
  const r = spawnSync(exe, ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', mp, '--replay', path.join(path.dirname(idxFile), g.file), '--bot', path.resolve(wasm), '--team', String(us), '--live-from', '1', '--to', String(TO), '--log', '300'], { encoding: 'utf8', maxBuffer: 1e9 });
  for (const l of r.stdout.split('\n')) {
    if (!l.startsWith('{"r"')) continue; const t = JSON.parse(l);
    if (!t.alive) { dead++; continue; }
    const m = /decision \d+ \d+ (\S+)/.exec(t.log || ''); const s = m ? m[1] : '?'; st[s] = (st[s] || 0) + 1; n++;
    const b = t.bot || []; if (b.some((a) => a.startsWith('attack') || a.startsWith('cast'))) act.camp++; else if (b.some((a) => a.startsWith('move'))) act.move++; else act.none++;
  }
}
console.log(`alive turns ${n}, dead ${(100 * dead / (n + dead)).toFixed(1)}% | attack/cast ${(100 * act.camp / n).toFixed(1)}% move ${(100 * act.move / n).toFixed(1)}% none ${(100 * act.none / n).toFixed(1)}%`);
console.log(Object.entries(st).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k, v]) => k + ' ' + (100 * v / n).toFixed(1) + '%').join(', '));
