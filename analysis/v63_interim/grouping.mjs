// Team cohesion in the opening: for rounds 20-200, per team, mean distance from each living champion to its nearest
// living teammate, and the share of champions with no teammate within 4 tiles. Heavy losses vs wins.
//   node grouping.mjs <games/index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const idxFile = process.argv[2];
const special = /contest|boss_battle/;
const cat = (g) => (g.result === 'win' ? 'win' : !special.test(g.map) && g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const acc = {};
for (const g of games) {
  const us = g.side === 'a' ? 0 : 1;
  const c = cat(g);
  const a = (acc[c] ||= { games: 0, near: [0, 0], alone: [0, 0], n: [0, 0] });
  a.games++;
  const res = await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'round' });
  for (const s of res.snapshots) {
    if (s.round < 20 || s.round > 200 || s.round % 5) continue;
    for (const team of [0, 1]) {
      const live = s.champions.filter((x) => x.team === team && x.alive && x.pos).map((x) => ({ x: x.pos[0], y: x.pos[1] }));
      if (live.length < 2) continue;
      const k = team === us ? 0 : 1;
      for (const p of live) {
        const d = Math.min(...live.filter((q) => q !== p).map((q) => cheb(p, q)));
        a.near[k] += d; a.n[k]++; if (d > 4) a.alone[k]++;
      }
    }
  }
}
for (const [c, a] of Object.entries(acc)) {
  console.log(`${c.padEnd(6)} ${a.games} games | nearest-teammate distance ours ${(a.near[0] / a.n[0]).toFixed(1)} theirs ${(a.near[1] / a.n[1]).toFixed(1)} | alone (>4 tiles) ours ${(100 * a.alone[0] / a.n[0]).toFixed(0)}% theirs ${(100 * a.alone[1] / a.n[1]).toFixed(0)}%`);
}
