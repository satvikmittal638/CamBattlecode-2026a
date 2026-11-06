// Our dashes cast below 35% HP: did the landing tile get nearer the nearest visible enemy (any enemy within 8),
// and did the dasher die within 6 rounds?   node analysis/v43x/bad_dashes.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
let low = 0, nearer = 0, nearerDied = 0, otherDied = 0; 
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const pend = [];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && ev.kind === 'Cast ability' && ev.abilityType === 'Dash' && ev.team === us && prev) {
      const me = prev.find((c) => c.entity.index === ev.actor.index); if (!me || !me.position || me.health / me.maxHealth >= 0.35) return;
      const en = prev.filter((c) => c.team !== us && c.alive && c.position && cheb(c.position, me.position) <= 8); if (!en.length) return;
      low++; const d0 = Math.min(...en.map((c) => cheb(c.position, me.position))), d1 = Math.min(...en.map((c) => cheb(c.position, { x: ev.to[0], y: ev.to[1] })));
      pend.push({ id: ev.actor.index, r: st.round, closer: d1 < d0 }); if (d1 < d0) nearer++; }
    if (prev) for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((y) => y.entity.index === c.entity.index); if (!b || !b.alive || c.alive) continue;
      for (const p of pend) if (p.id === c.entity.index && st.round - p.r <= 6 && !p.done) { p.done = true; if (p.closer) nearerDied++; else otherDied++; } }
  } });
}
console.log(`low-HP dashes with an enemy within 8: ${low}; landed nearer the nearest enemy: ${nearer} (died within 6 rounds: ${nearerDied}); others died within 6: ${otherDied}`);
