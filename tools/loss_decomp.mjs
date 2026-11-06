#!/usr/bin/env node
// Gem-economy decomposition per game (platform index.json): captured gems, gems carried at death
// (lost), kills/deaths, per team; prints per-game rows and loss/win aggregates.
//   node tools/loss_decomp.mjs <index.json> [--maps re]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from './replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const idx = JSON.parse(fs.readFileSync(args[0], 'utf8')); const dir = path.dirname(args[0]);
const re = new RegExp(opt('maps', '.'));
const agg = { win: [], loss: [] };
for (const x of idx.filter((x) => re.test(x.map))) {
  const us = x.side === 'a' ? 0 : 1; const T = [0, 1].map(() => ({ cap: 0, lost: 0, deaths: 0, gold: 0 }));
  await dumpReplay(path.join(dir, x.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!prev) return;
    for (const c of st.champions) { const b = prev.find((y) => y.entity.index === c.entity.index); if (!b) continue;
      if (b.alive && !c.alive) { T[c.team].deaths++; T[c.team].lost += b.gems; }
      if (ev && ev.kind === 'Capture') { T[c.team].cap += Math.max(0, c.gems - b.gems); T[c.team].gold += Math.max(0, c.gold - b.gold); } }
  } });
  const r = { label: x.label, map: x.map, res: x.result, score: x.score, opp: x.oppScore, us: T[us], op: T[1 - us], rounds: x.rounds };
  (agg[x.result === 'win' ? 'win' : 'loss']).push(r);
  if (!args.includes('--quiet')) console.log(`${x.label.padEnd(5)} ${x.map.padEnd(22)} ${x.result.padEnd(4)} ${String(x.score).padStart(4)}-${String(x.oppScore).padEnd(4)} cap ${T[us].cap}/${T[1 - us].cap} lostOnDeath ${T[us].lost}/${T[1 - us].lost} deaths ${T[us].deaths}/${T[1 - us].deaths} gold ${T[us].gold}/${T[1 - us].gold} r${x.rounds}`);
}
for (const k of ['win', 'loss']) { const R = agg[k]; if (!R.length) continue; const m = (f) => (R.reduce((s, r) => s + f(r), 0) / R.length).toFixed(0);
  console.log(`${k} n=${R.length} cap ${m((r) => r.us.cap)}/${m((r) => r.op.cap)} lost ${m((r) => r.us.lost)}/${m((r) => r.op.lost)} deaths ${m((r) => r.us.deaths)}/${m((r) => r.op.deaths)} gold ${m((r) => r.us.gold)}/${m((r) => r.op.gold)} per1000rounds cap ${m((r) => 1000 * r.us.cap / r.rounds)}/${m((r) => 1000 * r.op.cap / r.rounds)}`); }
