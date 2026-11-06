// For each own capture: of the capturer's moves since its previous capture (or spawn), how many reduced the Chebyshev
// distance to the capture spot (progress), kept it (side) or increased it (away). Also: moves spent while carrying
// gems toward an altar are excluded? No - counted, reported separately when the champion tributed in between.
//   node analysis/v43x/move_progress.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
let prog = 0, side = 0, away = 0, segs = 0, segTrib = 0, movesTrib = 0, movesNoTrib = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const seg = new Map();
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && ev.team === us && ev.actor?.kind === 1) { const s = seg.get(ev.actor.index) || { moves: [], trib: false };
      if (ev.kind === 'Move') s.moves.push([ev.from, ev.to]); if (ev.kind === 'Gems submitted' || ev.kind === 'Recall') s.trib = true; seg.set(ev.actor.index, s); }
    if (ev && ev.kind === 'Capture' && prev) for (const c of st.champions) { if (c.team !== us || !c.position) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(c.gems > b.gems || c.gold > b.gold)) continue;
      const s = seg.get(c.entity.index) || { moves: [], trib: false }; const P = [c.position.x, c.position.y]; segs++;
      for (const [f, t] of s.moves) { const d0 = cheb(f, P), d1 = cheb(t, P); if (d1 < d0) prog++; else if (d1 > d0) away++; else side++; }
      if (s.trib) { segTrib++; movesTrib += s.moves.length; } else movesNoTrib += s.moves.length;
      seg.set(c.entity.index, { moves: [], trib: false }); }
  } });
}
const n = prog + side + away;
console.log(`captures ${segs}: moves toward capture spot ${(100 * prog / n).toFixed(0)}%, sideways ${(100 * side / n).toFixed(0)}%, away ${(100 * away / n).toFixed(0)}%; segments with a tribute/recall ${(100 * segTrib / segs).toFixed(0)}% (moves/segment ${(movesTrib / Math.max(1, segTrib)).toFixed(1)}), without ${(movesNoTrib / Math.max(1, segs - segTrib)).toFixed(1)} moves/segment`);
