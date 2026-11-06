// Enemy recalls started while one of our living champions was within 4 tiles: was the recall interrupted (the enemy
// took damage before arriving), did the enemy die within 8 rounds, and its HP fraction at recall start.
//   node analysis/v43x/recall_punish.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
let near = 0, hit = 0, died = 0, games = 0; const hp = [];
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++; const open = [];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && ev.kind === 'Recall' && ev.team !== us && prev) { const e = prev.find((c) => c.entity.index === ev.actor.index);
      if (e && e.position && prev.some((c) => c.team === us && c.alive && c.position && cheb(c.position, e.position) <= 4)) { near++; hp.push(e.health / e.maxHealth); open.push({ id: e.entity.index, r: st.round, hp: e.health, hit: false, died: false }); } }
    for (const o of open) { if (st.round - o.r > 8) continue; const c = st.champions.find((x) => x.entity.index === o.id); if (!c) continue;
      if (!o.hit && c.alive && c.health < o.hp - 0.5 && st.round - o.r <= 5) { o.hit = true; hit++; }
      if (!o.died && !c.alive) { o.died = true; died++; } }
  } });
}
const med = [...hp].sort((a, b) => a - b)[Math.floor(hp.length / 2)];
console.log(`games ${games}: enemy recalls with our champion within 4: ${(near / games).toFixed(2)}/game; damaged during the channel ${(100 * hit / Math.max(1, near)).toFixed(0)}%; died within 8 rounds ${(100 * died / Math.max(1, near)).toFixed(0)}%; median HP at recall ${(100 * med).toFixed(0)}%`);
