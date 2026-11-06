// Collect the opening situation for each map/side: champion spawn tiles, per-champion distances to groups, and observed first target.
import fs from 'node:fs';
import { dumpReplay, loadIndex, loadMap, bfs } from './lib.mjs';
const rows = loadIndex().slice(0, 300);
const done = new Set(); const cases = [];
for (const r of rows) {
  const key = r.map + r.side; if (done.has(key)) continue;
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  const s0 = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const campGroup = {}; for (const c of d.snapshots[1].camps) campGroup[c.id] = M.campAt.get(c.pos.join(','));
  const champs = s0.champions.filter((c) => c.team === me);
  const out = { map: r.map, side: r.side, champs: [] };
  for (const c of champs) {
    const df = bfs(M, [c.pos]);
    const dist = M.groups.map((g) => { let best = 1e9; for (const cc of g.camps) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = cc.x + dx, y = cc.y + dy; if (x >= 0 && y >= 0 && x < M.W && y < M.H) { const v = df(x, y); if (v >= 0 && v < best) best = v; } } return best; });
    // first camp group this champion intended: first camp attack (ignore before r3)
    const e = d.events.find((x) => x.actor?.kind === 1 && x.actor.index === c.id && (x.kind === 'Attack' || x.kind === 'Cast ability') && x.target?.kind === 'camp');
    out.champs.push({ type: c.type, pos: c.pos, dist, first: e ? campGroup[e.target.id] : null, firstRound: e?.round });
  }
  cases.push(out); done.add(key);
}
fs.writeFileSync('analysis/whim/opening_cases.json', JSON.stringify(cases));
for (const c of cases) console.log(c.map, c.side, c.champs.map((x) => `${x.type}@${x.pos} -> g${x.first}(d${x.dist[x.first]})`).join(' | '));
