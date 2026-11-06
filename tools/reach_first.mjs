#!/usr/bin/env node
// Count games where our tributed+carried gems reached 1000 before the opponent's but we lost.
//   node tools/reach_first.mjs <fieldEvalDir> [--variants a,b]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from './replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(args[0]);
const res = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
const vs = opt('variants') ? opt('variants').split(',') : Object.keys(res.variants);
const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
for (const v of vs) {
  let reachLoss = 0, reachWin = 0, list = [];
  for (const r of res.rows.filter((r) => r.variant === v && !r.error)) {
    const us = r.side === 'a' ? 0 : 1; const reach = [null, null];
    await dumpReplay(path.join(ROOT, r.replay), { snapshots: 'none', onStep(st) {
      for (const t of [0, 1]) { if (reach[t] !== null) continue; const c = st.champions.filter((x) => x.team === t && x.alive).reduce((s, x) => s + x.gems, 0); if ((st.submittedGems?.[t] ?? 0) + c >= 1000) reach[t] = st.round; }
    } });
    const first = reach[us] !== null && (reach[1 - us] === null || reach[us] < reach[1 - us]);
    if (first) { if (r.win) reachWin++; else { reachLoss++; list.push(`${r.opponent}/${r.map}/${r.side}@${reach[us]}vs${reach[1 - us]}`); } }
  }
  console.log(v.padEnd(10), 'reached-first wins', reachWin, 'losses', reachLoss, list.join(' '));
}
