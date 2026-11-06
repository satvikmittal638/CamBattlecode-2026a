// Heatmap data for one side of platform replays (one JSON per game, small grids only):
// terrain (walls/holes/bushes/altars/spawns), our alive-champion occupancy per round, enemy occupancy, our HP lost to
// enemy champions and to camps by tile, our death tiles, camp tiles; plus per-sample spawn-relative positions.
//   node heat_extract.mjs <index.json> <outDir> [--filter heavy|win|all]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [idxFile, outDir] = args; const filter = opt('filter', 'all'); const special = /contest|boss_battle/;
fs.mkdirSync(outDir, { recursive: true });
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !special.test(g.map)).map((g) => ({ ...g, cls: g.result === 'win' ? 'win' : (g.oppScore - g.score >= 500 ? 'heavy' : 'loss') })).filter((g) => filter === 'all' || g.cls === filter);
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; let W, H, info; let lr = -1;
  const grid = () => new Array(W * H).fill(0);
  let occ, eocc, dmgC, dmgK, deaths, rel = [];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', mapInfo: true,
    onStart(s) { W = s.width; H = s.height; info = s.mapInfo; occ = grid(); eocc = grid(); dmgC = grid(); dmgK = grid(); deaths = []; },
    onStep(st, ev, prev) {
      if (st.round !== lr) { lr = st.round; for (const c of st.champions) { if (!c.alive || !c.position) continue; const i = c.position.y * W + c.position.x;
        if (c.team === us) { occ[i]++; const a = rectDist(info.spawn[us], c.position), b = rectDist(info.spawn[1 - us], c.position); if (st.round % 5 === 0) rel.push(+(a / Math.max(1, a + b)).toFixed(2)); } else eocc[i]++; } }
      if (!prev) return; const actorKind = st.step.actor.kind;
      for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !b.alive || !b.position) continue;
        const lost = b.health - c.health; const i = b.position.y * W + b.position.x;
        if (lost > 0.5) { if (actorKind === 1) dmgC[i] += lost; else if (actorKind === 2) dmgK[i] += lost; }
        if (!c.alive) { const a = rectDist(info.spawn[us], b.position), e = rectDist(info.spawn[1 - us], b.position); deaths.push([b.position.x, b.position.y, st.round, +(a / Math.max(1, a + e)).toFixed(2)]); } }
    } });
  const terr = new Array(W * H).fill(0); // 1 wall 2 hole 3 bush 4 altar
  for (let i = 0; i < W * H; i++) terr[i] = info.walls[i] ? 1 : info.holes[i] ? 2 : info.bushes[i] ? 3 : 0;
  for (const [x, y] of info.altars) terr[y * W + x] = 4;
  const rec = { map: g.map, opp: g.opponent, cls: g.cls, score: [g.score, g.oppScore], side: g.side, W, H, spawnUs: info.spawn[us], spawnThem: info.spawn[1 - us], terr, occ, eocc, dmgC: dmgC.map(Math.round), dmgK: dmgK.map(Math.round), deaths, rel };
  fs.writeFileSync(path.join(outDir, `${g.map}__${g.cls}__${g.matchId.slice(0, 8)}.json`), JSON.stringify(rec));
}
console.log('games', idx.length, 'by class', JSON.stringify(idx.reduce((m, g) => ((m[g.cls] = (m[g.cls] || 0) + 1), m), {})));
