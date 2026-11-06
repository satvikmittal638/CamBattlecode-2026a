// First round of each "caught alone" episode (2+ enemies within 6, no ally within 4, not caught the previous round):
// HP, gems carried, nearest ally distance, distance to own spawn, enemies' total HP vs ours, and what happens next
// round (retreat / hold / approach vs the nearest enemy) and within 10 rounds (death). Split by game result.
//   node caught_alone.mjs <dir> [<dir>...] --label name
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2), label = args.includes('--label') ? args[args.indexOf('--label') + 1] : '';
const dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--label');
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const R = { win: [], loss: [] };
for (const d of dirs) for (const g of JSON.parse(fs.readFileSync(path.join(d, 'index.json'), 'utf8'))) {
  let dump; try { dump = await dumpReplay(path.join(d, g.file), { snapshots: 'round', mapInfo: true }); } catch { continue; }
  const team = g.side === 'a' ? 0 : 1, res = g.result === 'win' ? 'win' : 'loss', S = dump.snapshots;
  const sp = dump.meta.mapInfo.spawn[team === 0 ? 'a' : 'b'] || dump.meta.mapInfo.spawn[team];
  const home = sp ? [(sp.minX + sp.maxX) / 2, (sp.minY + sp.maxY) / 2] : null;
  const prevAlone = new Set();
  for (let i = 0; i + 1 < S.length; i++) {
    const s = S[i]; if (s.round < 20) continue;
    const alive = s.champions.filter((c) => c.alive && c.pos), mine = alive.filter((c) => c.team === team), foes = alive.filter((c) => c.team !== team);
    const nowAlone = new Set();
    for (const c of mine) {
      const f6 = foes.filter((e) => cheb(e.pos, c.pos) <= 6), allies = mine.filter((o) => o.id !== c.id);
      if (f6.length < 2 || allies.some((o) => cheb(o.pos, c.pos) <= 4)) continue;
      nowAlone.add(c.id); if (prevAlone.has(c.id)) continue;
      const near = f6.reduce((m, e) => (cheb(e.pos, c.pos) < cheb(m.pos, c.pos) ? e : m)), next = S[i + 1].champions.find((o) => o.id === c.id);
      let move = 'dead'; if (next?.alive && next.pos) { const d0 = cheb(near.pos, c.pos), d1 = cheb(near.pos, next.pos); move = d1 > d0 ? 'retreat' : d1 < d0 ? 'approach' : 'hold'; }
      let died = false; for (let k = i + 1; k <= i + 10 && k < S.length; k++) { const z = S[k].champions.find((o) => o.id === c.id); if (z && !z.alive) { died = true; break; } }
      R[res].push({ hp: c.hp / c.maxHp, gems: c.gems, ally: allies.length ? Math.min(...allies.map((o) => cheb(o.pos, c.pos))) : 99,
        home: home ? cheb([Math.round(home[0]), Math.round(home[1])], c.pos) : null, foes: f6.length, near: cheb(near.pos, c.pos),
        hpRatio: c.hp / f6.reduce((t, e) => t + e.hp, 0), move, died });
    }
    prevAlone.clear(); for (const x of nowAlone) prevAlone.add(x);
  }
}
const avg = (a, f) => (a.reduce((t, x) => t + f(x), 0) / Math.max(1, a.length));
for (const res of ['win', 'loss']) {
  const a = R[res]; if (!a.length) continue; const mv = a.reduce((o, x) => ((o[x.move] = (o[x.move] || 0) + 1), o), {});
  const byMove = Object.fromEntries(['retreat', 'hold', 'approach'].map((m) => [m, a.filter((x) => x.move === m)]));
  console.log(`${label} ${res}: ${a.length} episodes | HP ${avg(a, (x) => x.hp).toFixed(2)} gems ${avg(a, (x) => x.gems).toFixed(1)} nearest ally ${avg(a, (x) => Math.min(x.ally, 30)).toFixed(1)} from home ${avg(a, (x) => x.home ?? 0).toFixed(1)} enemies ${avg(a, (x) => x.foes).toFixed(1)} nearest ${avg(a, (x) => x.near).toFixed(1)} our/their HP ${avg(a, (x) => x.hpRatio).toFixed(2)} | next move ${Object.entries(mv).map(([k, v]) => k + ' ' + Math.round(100 * v / a.length) + '%').join(' ')} | died within 10: ${Math.round(100 * avg(a, (x) => x.died))}% (after retreat ${Math.round(100 * avg(byMove.retreat, (x) => x.died))}%, hold ${Math.round(100 * avg(byMove.hold, (x) => x.died))}%, approach ${Math.round(100 * avg(byMove.approach, (x) => x.died))}%)`);
}
