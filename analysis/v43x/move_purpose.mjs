// Classify the index side's champion moves: low HP (<40%), enemy champion within 6, carrying >= 20 gems (bank
// trip), carrying gold >= 150 (shop money), otherwise (travel). Also moves on/near own spawn (within 3).
//   node analysis/v43x/move_purpose.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
const C = {}; let games = 0, total = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++; let spawn;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', mapInfo: true, onStart({ mapInfo }) { spawn = mapInfo.spawn[us]; }, onStep(st, ev, prev) {
    if (!ev || ev.kind !== 'Move' || ev.team !== us || ev.actor?.kind !== 1 || !prev) return;
    const me = prev.find((c) => c.entity.index === ev.actor.index); if (!me || !me.position) return; total++;
    const enemy = prev.some((c) => c.team !== us && c.alive && c.position && cheb(c.position, me.position) <= 6);
    const k = me.health / me.maxHealth < 0.4 ? 'lowHP' : enemy ? 'enemyNear' : me.gems >= 20 ? 'bankTrip' : rectDist(spawn, me.position) <= 3 ? 'nearSpawn' : 'travel';
    C[k] = (C[k] || 0) + 1;
  } });
}
console.log(`games ${games}, moves/game ${(total / games).toFixed(0)}: ` + Object.entries(C).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / games).toFixed(0)} (${(100 * v / total).toFixed(0)}%)`).join(', '));
