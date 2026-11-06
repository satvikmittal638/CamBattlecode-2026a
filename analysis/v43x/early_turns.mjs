// Champion-turn allocation in rounds 1..R (default 150) for the index side: farm (hit a camp), fight (hit a champion),
// move (moved, no hit), channel (recall/tribute in progress or started), idle (alive, no action), dead.
//   node analysis/v43x/early_turns.mjs <index.json> [R]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const R = Number(process.argv[3] || 150); const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const C = {}; let n = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const act = new Map(); const chan = new Map(); let lr = -1, last = null;
  const close = () => { if (!last) return; for (const c of last.champions) { if (c.team !== us) continue; const f = act.get(c.entity.index) || {}; let k;
    if (!c.alive) k = 'dead'; else if (f.farm) k = 'farm'; else if (f.fight) k = 'fight'; else if (chan.get(c.entity.index)) k = 'channel'; else if (f.move) k = 'move'; else k = 'idle';
    C[k] = (C[k] || 0) + 1; n++; } act.clear(); };
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev) {
    if (st.round !== lr) { if (lr >= 5 && lr <= R) close(); lr = st.round; last = st; }
    if (st.round > R || !ev || ev.team !== us || ev.actor?.kind !== 1) return; const id = ev.actor.index; const f = act.get(id) || {}; act.set(id, f);
    if (ev.kind === 'Move') { f.move = true; chan.delete(id); }
    if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') f.farm = true;
    if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') f.fight = true;
    if (ev.kind === 'Recall' || ev.kind === 'Submit gems') chan.set(id, true); if (ev.kind === 'Gems submitted' || ev.kind === 'Respawn') chan.delete(id);
  } });
}
console.log(`champion-turns r5..${R}: ` + Object.entries(C).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / n).toFixed(1)}%`).join(', '));
