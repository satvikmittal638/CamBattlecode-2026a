// Health management: alive rounds 20-1500 off the own spawn - mean HP share, share of rounds below 60% / 40%, and the
// HP at which champions start walking home/recalling (first round of returning to spawn after >= 30 rounds away).
//   node hp_profile.mjs <dir> [<dir>...] --label name
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2), label = args.includes('--label') ? args[args.indexOf('--label') + 1] : '';
const dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--label');
const A = { win: { n: 0, hp: 0, lt60: 0, lt40: 0, homeHp: [], games: 0 }, loss: { n: 0, hp: 0, lt60: 0, lt40: 0, homeHp: [], games: 0 } };
for (const d of dirs) for (const g of JSON.parse(fs.readFileSync(path.join(d, 'index.json'), 'utf8'))) {
  let dump; try { dump = await dumpReplay(path.join(d, g.file), { snapshots: 'round', mapInfo: true }); } catch { continue; }
  const team = g.side === 'a' ? 0 : 1, a = A[g.result === 'win' ? 'win' : 'loss']; a.games++;
  const sp = dump.meta.mapInfo.spawn[team === 0 ? 'a' : 'b'] || dump.meta.mapInfo.spawn[team];
  const onSpawn = (p) => sp && p[0] >= sp.minX && p[0] <= sp.maxX && p[1] >= sp.minY && p[1] <= sp.maxY;
  const away = new Map(), lastHp = new Map();
  for (const s of dump.snapshots) {
    if (s.round < 20 || s.round > 1500) continue;
    for (const c of s.champions) {
      if (c.team !== team || !c.alive || !c.pos) { away.set(c.id, 0); continue; }
      if (onSpawn(c.pos)) { if ((away.get(c.id) || 0) >= 30 && lastHp.has(c.id)) a.homeHp.push(lastHp.get(c.id)); away.set(c.id, 0); continue; }
      away.set(c.id, (away.get(c.id) || 0) + 1); lastHp.set(c.id, c.hp / c.maxHp);
      const f = c.hp / c.maxHp; a.n++; a.hp += f; if (f < 0.6) a.lt60++; if (f < 0.4) a.lt40++;
    }
  }
}
for (const [res, a] of Object.entries(A)) {
  if (!a.games) continue; const h = a.homeHp.sort((x, y) => x - y), q = (p) => h.length ? h[Math.floor(p * (h.length - 1))].toFixed(2) : '-';
  console.log(`${label} ${res}: ${a.games} games | off-spawn mean HP ${(a.hp / a.n).toFixed(2)} | below 60% ${(100 * a.lt60 / a.n).toFixed(0)}% below 40% ${(100 * a.lt40 / a.n).toFixed(0)}% of alive off-spawn rounds | returns home ${(h.length / a.games).toFixed(1)}/game at HP p25 ${q(.25)} median ${q(.5)} p75 ${q(.75)}`);
}
