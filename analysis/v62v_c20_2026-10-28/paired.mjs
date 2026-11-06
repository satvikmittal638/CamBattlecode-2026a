// Paired platform comparison: v62v (this folder) vs v62 (../v62_c100_2026-10-27) on identical specs (same opponent,
// map and side per game). Prints challenges won per pool for both, game flips, margin change, and per-map flips.
//   node paired.mjs
import fs from 'node:fs';
const dir = import.meta.dirname;
const load = (d) => JSON.parse(fs.readFileSync(`${d}/games/index.json`, 'utf8'));
const A = load(`${dir}/../v62_c100_2026-10-27`), B = load(dir);
const key = (g) => `${g.label}|${g.map}|${g.side}`;
const a = new Map(A.map((g) => [key(g), g]));
const pools = {}, maps = {};
for (const g of B) {
  const o = a.get(key(g)); if (!o) continue;
  const p = (pools[g.pool] ??= { n: 0, wA: 0, wB: 0, up: 0, down: 0, dm: 0, chA: {}, chB: {} });
  p.n++; p.wA += o.result === 'win'; p.wB += g.result === 'win';
  if (g.result === 'win' && o.result !== 'win') p.up++;
  if (g.result !== 'win' && o.result === 'win') p.down++;
  p.dm += (g.score - g.oppScore) - (o.score - o.oppScore);
  (p.chA[g.label] ??= [0, 0]); p.chA[g.label][0] += o.result === 'win'; p.chA[g.label][1]++;
  (p.chB[g.label] ??= [0, 0]); p.chB[g.label][0] += g.result === 'win'; p.chB[g.label][1]++;
  const m = (maps[g.map] ??= [0, 0]); m[0] += (g.result === 'win') - (o.result === 'win'); m[1]++;
}
for (const [k, p] of Object.entries(pools)) {
  const full = Object.keys(p.chB).filter((l) => p.chB[l][1] === 5);
  const won = (ch) => full.filter((l) => ch[l][0] >= 3).length;
  console.log(`${k}: ${p.n} paired games | games won v62 ${p.wA} -> v62v ${p.wB} (flips +${p.up}/-${p.down}) | mean margin change ${(p.dm / p.n).toFixed(0)} | challenges (complete ${full.length}) v62 ${won(p.chA)} -> v62v ${won(p.chB)}`);
}
console.log('map net flips (v62v - v62):', Object.entries(maps).filter(([, m]) => m[0]).sort((x, y) => y[1][0] - x[1][0]).map(([k, m]) => `${k} ${m[0] > 0 ? '+' : ''}${m[0]}`).join(', '));
