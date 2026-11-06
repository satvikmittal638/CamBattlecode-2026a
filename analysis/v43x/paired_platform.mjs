// Paired comparison of two platform runs with the same specs (label|map|side): wins per pool,
// discordant games, exact two-sided sign test on discordant pairs.
//   node analysis/v43x/paired_platform.mjs <base index.json> <new index.json>
import fs from 'node:fs';
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const key = (x) => `${x.label}|${x.map}|${x.side}`;
const a = new Map(A.map((x) => [key(x), x]));
const pools = {}; let plus = 0, minus = 0; const flips = [];
for (const x of B) { const y = a.get(key(x)); const p = x.label.split('_')[0]; const s = pools[p] = pools[p] || { n: 0, wa: 0, wb: 0 };
  s.wb += x.result === 'win'; if (!y) continue; s.n++; s.wa += y.result === 'win';
  if ((x.result === 'win') !== (y.result === 'win')) { if (x.result === 'win') plus++; else minus++; flips.push(`${x.result === 'win' ? '+' : '-'} ${key(x).padEnd(36)} ${y.score}-${y.oppScore} -> ${x.score}-${x.oppScore}`); } }
const binom = (n, k) => { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; };
const n = plus + minus, k = Math.min(plus, minus); let p = 0; for (let i = 0; i <= k; i++) p += binom(n, i); p = Math.min(1, 2 * p / 2 ** n);
for (const [k2, s] of Object.entries(pools)) console.log(`${k2}: base ${s.wa}/${s.n}  new ${s.wb}/${B.filter((x) => x.label.startsWith(k2 + '_')).length}`);
console.log(`discordant +${plus}/-${minus}, sign test p=${p.toFixed(3)}`);
for (const f of flips.sort()) console.log('  ' + f);
