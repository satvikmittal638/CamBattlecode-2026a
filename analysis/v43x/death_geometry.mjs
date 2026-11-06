// Our deaths in a platform run: distance to own spawn at death, HP fraction 3/6/10 rounds before,
// spawn distance 6 rounds before (did the victim head home?), enemies/allies within 5 at t-3.
//   node analysis/v43x/death_geometry.mjs <index.json> [maps regex]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const re = new RegExp(process.argv[3] || '.');
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => re.test(g.map));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
const rows = [];
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; let spawn; const hist = new Map(); let lastR = -1;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', mapInfo: true, onStart({ mapInfo }) { spawn = mapInfo.spawn; }, onStep(st, ev, prev) {
    if (st.round !== lastR) { lastR = st.round; for (const c of st.champions) { const h = hist.get(c.entity.index) || []; h.push({ r: st.round, hp: c.health / Math.max(1, c.maxHealth), p: c.position, alive: c.alive, team: c.team }); if (h.length > 12) h.shift(); hist.set(c.entity.index, h); } }
    if (!prev) return;
    for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((y) => y.entity.index === c.entity.index); if (!b || !b.alive || c.alive || !b.position) continue;
      const h = hist.get(c.entity.index) || []; const at = (k) => h[Math.max(0, h.length - 1 - k)];
      const near = (k, team) => { const me = at(k); if (!me?.p) return 0; let n = 0; for (const [id, hh] of hist) { if (id === c.entity.index) continue; const o = hh[Math.max(0, hh.length - 1 - k)]; if (o && o.alive && o.p && o.team === team && cheb(o.p, me.p) <= 5) n++; } return n; };
      rows.push({ map: g.map, label: g.label, round: st.round, type: CHAMPION_TYPES[c.type], dHome: rectDist(spawn[us], b.position), dHome6: at(6)?.p ? rectDist(spawn[us], at(6).p) : null, hp3: at(3)?.hp, hp6: at(6)?.hp, hp10: at(10)?.hp, en3: near(3, 1 - us), al3: near(3, us) }); } } });
}
const n = rows.length; const pct = (f) => (100 * rows.filter(f).length / Math.max(1, n)).toFixed(0) + '%';
console.log(`our deaths ${n} in ${idx.length} games`);
console.log(`dist to own spawn at death: <=6 ${pct((r) => r.dHome <= 6)}, 7-12 ${pct((r) => r.dHome > 6 && r.dHome <= 12)}, 13-20 ${pct((r) => r.dHome > 12 && r.dHome <= 20)}, >20 ${pct((r) => r.dHome > 20)}`);
console.log(`hp 6 rounds before: <35% ${pct((r) => r.hp6 < 0.35)}, 35-60% ${pct((r) => r.hp6 >= 0.35 && r.hp6 < 0.6)}, >=60% ${pct((r) => r.hp6 >= 0.6)}`);
console.log(`hp 3 rounds before: <35% ${pct((r) => r.hp3 < 0.35)}, 35-60% ${pct((r) => r.hp3 >= 0.35 && r.hp3 < 0.6)}, >=60% ${pct((r) => r.hp3 >= 0.6)}`);
console.log(`below 35% for 6+ rounds and within 12 of home: ${pct((r) => r.hp6 < 0.35 && r.dHome <= 12)}; got closer to home over last 6 rounds: ${pct((r) => r.dHome6 != null && r.dHome < r.dHome6)}`);
console.log(`enemies within 5 at t-3: 0 ${pct((r) => r.en3 === 0)}, 1 ${pct((r) => r.en3 === 1)}, 2 ${pct((r) => r.en3 === 2)}, 3+ ${pct((r) => r.en3 >= 3)}; outnumbered (en>al+1 incl. self) ${pct((r) => r.en3 > r.al3 + 1)}`);
const ofs = process.argv[4]; if (ofs) fs.writeFileSync(ofs, rows.map((r) => JSON.stringify(r)).join('\n'));
