// Monolith clears per map and side: a monolith camp whose health drops to 0 (credited to the side
// whose champion captured gems right after, else to the side with the nearest champion).
//   node analysis/v43x/monolith_kills.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const by = {};
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; let has = false; const kills = [0, 0]; const big = [0, 0];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev, prevCamps) {
    if (!prevCamps) return;
    for (const c of prevCamps) if (c.type === 4) { has = true; const n = st.camps.find((x) => x.entity.index === c.entity.index); if (c.health > 0 && (!n || n.health <= 0)) { let best = 99, side = -1; for (const ch of st.champions) if (ch.alive && ch.position) { const d = Math.max(Math.abs(ch.position.x - c.position.x), Math.abs(ch.position.y - c.position.y)); if (d < best) { best = d; side = ch.team; } } if (side >= 0) kills[side === us ? 0 : 1]++; } }
    if (ev && ev.kind === 'Capture' && prev) for (const ch of st.champions) { const b = prev.find((x) => x.entity.index === ch.entity.index); if (b && ch.gems - b.gems >= 150) big[ch.team === us ? 0 : 1]++; }
  } });
  if (!has) continue;
  const m = by[g.map] = by[g.map] || { n: 0, w: 0, k: [0, 0], cap: [0, 0] }; m.n++; m.w += g.result === 'win'; m.k[0] += kills[0]; m.k[1] += kills[1]; m.cap[0] += big[0]; m.cap[1] += big[1];
}
for (const [m, v] of Object.entries(by)) console.log(m.padEnd(20), `games ${v.n} wins ${v.w} monolith kills us/them ${v.k[0]}/${v.k[1]} 150+gem captures us/them ${v.cap[0]}/${v.cap[1]}`);
