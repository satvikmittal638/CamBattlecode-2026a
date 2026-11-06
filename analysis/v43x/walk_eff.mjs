// Walking efficiency of the index's side: per champion, move steps between consecutive captures it made, vs the
// Chebyshev distance between those capture spots; also moves that reverse direction (dot < 0 with previous move).
//   node analysis/v43x/walk_eff.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
let moves = 0, rev = 0, caps = 0, stepsBetween = 0, chebBetween = 0, games = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++; const st8 = new Map();
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && ev.kind === 'Move' && ev.team === us && ev.actor?.kind === 1) {
      const s = st8.get(ev.actor.index) || { steps: 0, last: null, dir: null }; moves++; s.steps++;
      const d = [ev.to[0] - ev.from[0], ev.to[1] - ev.from[1]]; if (s.dir && d[0] * s.dir[0] + d[1] * s.dir[1] < 0) rev++; s.dir = d; st8.set(ev.actor.index, s); }
    if (ev && ev.kind === 'Capture' && prev) for (const c of st.champions) { if (c.team !== us || !c.position) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(c.gems > b.gems || c.gold > b.gold)) continue;
      const s = st8.get(c.entity.index) || { steps: 0, last: null, dir: null }; caps++;
      if (s.last) { stepsBetween += s.steps; chebBetween += Math.max(Math.abs(c.position.x - s.last.x), Math.abs(c.position.y - s.last.y)); }
      s.last = { ...c.position }; s.steps = 0; st8.set(c.entity.index, s); }
  } });
}
console.log(`games ${games}: moves/game ${(moves / games).toFixed(0)}, reversals ${(100 * rev / moves).toFixed(1)}%, captures/game ${(caps / games).toFixed(1)}, steps between own captures ${(stepsBetween / Math.max(1, caps)).toFixed(1)} vs straight distance ${(chebBetween / Math.max(1, caps)).toFixed(1)} (efficiency ${(chebBetween / Math.max(1, stepsBetween)).toFixed(2)})`);
