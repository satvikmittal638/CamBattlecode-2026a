// Share of captured gems / gold and tributed gems per champion type for the side in index.json.
//   node analysis/v43x/carry_share.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2];
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const S = {};
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!ev || !prev) return;
    if (ev.kind === 'Capture') for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue; const t = CHAMPION_TYPES[c.type]; const s = S[t] = S[t] || { gems: 0, gold: 0, trib: 0, n: 0 }; s.gems += Math.max(0, c.gems - b.gems); s.gold += Math.max(0, c.gold - b.gold); }
    if (ev.kind === 'Gems submitted' && ev.team === us) { const b = prev.find((x) => x.entity.index === ev.actor.index); if (b) { const t = CHAMPION_TYPES[b.type]; const s = S[t] = S[t] || { gems: 0, gold: 0, trib: 0, n: 0 }; s.trib += b.gems; } }
  } });
  for (const t of new Set()) ;
}
const tot = Object.values(S).reduce((a, s) => ({ gems: a.gems + s.gems, gold: a.gold + s.gold, trib: a.trib + s.trib }), { gems: 0, gold: 0, trib: 0 });
for (const [t, s] of Object.entries(S).sort((a, b) => b[1].gems - a[1].gems)) console.log(t.padEnd(12), 'captured gems', (100 * s.gems / tot.gems).toFixed(0) + '%', 'capture gold', (100 * s.gold / tot.gold).toFixed(0) + '%', 'tributed', (100 * s.trib / Math.max(1, tot.trib)).toFixed(0) + '%');
console.log('per game: gems', (tot.gems / idx.length).toFixed(0), 'gold', (tot.gold / idx.length).toFixed(0), 'tributed', (tot.trib / idx.length).toFixed(0));
