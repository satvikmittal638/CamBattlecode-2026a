#!/usr/bin/env node
// Idle share per team: alive champion-turns (rounds 5..maxRound) with no Move/Attack/Cast/Recall/
// Submit/Shop/Ward action. node tools/idle_share.mjs <replay...> [--max 400]
import { dumpReplay } from './replay_dump.mjs';
const args = process.argv.slice(2);
const mi = args.indexOf('--max'); const MAX = mi >= 0 ? +args[mi + 1] : 400;
const files = args.filter((a, i) => !a.startsWith('--') && (mi < 0 || i !== mi + 1));
const ACT = new Set(['Move', 'Attack', 'Cast ability', 'Recall', 'Submit gems', 'Shop', 'Place ward']);
for (const f of files) {
  const alive = new Map(), act = new Set(), team = new Map();
  await dumpReplay(f, { snapshots: 'none', onStep(st, ev) {
    if (st.round > MAX) return;
    for (const c of st.champions) { team.set(c.entity.index, c.team); alive.set(st.round + '|' + c.entity.index, c.alive); }
    if (ev && ev.actor?.kind === 1 && ACT.has(ev.kind)) act.add(st.round + '|' + ev.actor.index);
  } });
  const n = [0, 0], idle = [0, 0];
  for (const [k, a] of alive) { const [r, c] = k.split('|'); if (+r < 5 || !a) continue; const t = team.get(+c); n[t]++; if (!act.has(k)) idle[t]++; }
  console.log(f.split('/').pop().padEnd(48), `A idle ${(100 * idle[0] / n[0]).toFixed(1)}% (${n[0]})  B idle ${(100 * idle[1] / n[1]).toFixed(1)}% (${n[1]})`);
}
