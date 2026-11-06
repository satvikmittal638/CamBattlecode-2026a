// Fit a sequential-greedy target-assignment model to WHIM's observed opening choices.
import fs from 'node:fs';
import { loadMap } from './lib.mjs';
const cases = JSON.parse(fs.readFileSync('analysis/whim/opening_cases.json', 'utf8'));
const HPK = { W: 1350, K: 2400, G: 500, D: 500, M: 20000 }, DMG = { W: 20, K: 60, G: 0, D: 0, M: 200 };
const DPS = { Varg: 56, Ryth: 69, Vendetta: 79, Ren: 56, Marcella: 63 };
function run(c, P, verbose) {
  const M = loadMap(c.map);
  const assigned = M.groups.map(() => []);
  let correct = 0; const picks = [];
  for (const ch of c.champs) {
    let best = -1, bs = -1e9;
    for (const g of M.groups) {
      if (g.camps.some((x) => x.k === 'M')) continue;
      if (g.gems === 0) continue;
      const d = ch.dist[g.id]; if (d >= 1e8) continue;
      const hp = g.camps.reduce((s, x) => s + HPK[x.k], 0);
      const dmg = g.camps.reduce((s, x) => s + DMG[x.k], 0);
      const n = assigned[g.id].length;
      if (P.cap && n >= P.cap(g, hp, dmg)) continue;
      const myDps = DPS[ch.type] * (ch.type === 'Varg' ? Math.min(3, g.camps.length) * P.splash + (1 - P.splash) : 1);
      const teamDps = myDps + P.beta * assigned[g.id].reduce((s, t) => s + DPS[t], 0);
      const value = g.gems + P.wg * g.gold;
      const arrive = Math.max(d, P.wait && n ? Math.min(...assigned[g.id].map(() => d)) : d);
      const time = d + hp / teamDps + P.danger * dmg * hp / teamDps / 100;
      const score = value / Math.pow(n + 1, P.alpha) / time;
      if (score > bs) { bs = score; best = g.id; }
    }
    if (best >= 0) assigned[best].push(ch.type);
    picks.push(best);
    if (best === ch.first) correct++;
  }
  if (verbose) console.log(c.map, c.side, c.champs.map((x, i) => `${x.type}:${picks[i]}${picks[i] === x.first ? '' : '(obs ' + x.first + ')'}`).join(' '));
  return correct;
}
const grid = [];
for (const wg of [0, 0.1, 0.2, 0.3, 0.5]) for (const alpha of [0, 0.5, 1, 1.5, 2, 3]) for (const beta of [0, 0.5, 1]) for (const danger of [0, 0.5, 1, 2]) for (const splash of [0, 1]) grid.push({ wg, alpha, beta, danger, splash });
let bestP = null, bestN = -1;
const sel = cases.filter((c) => c.side === (process.argv[2] || 'b'));
for (const P of grid) { const n = sel.reduce((s, c) => s + run(c, P), 0); if (n > bestN) { bestN = n; bestP = P; } }
const total = sel.reduce((s, c) => s + c.champs.length, 0);
console.log('best', bestP, bestN, '/', total);
for (const c of cases) run(c, bestP, true);
