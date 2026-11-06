// Paired win flips of one field_eval variant vs 'base' by map stratum and by opponent (same strata as the l1 gate).
//   node analysis/v41_live_iteration/strata.mjs <fieldEvalDir> [variant=hh]
import fs from 'node:fs';
import path from 'node:path';
const [dir, variant = 'hh'] = process.argv.slice(2);
const r = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8')).rows;
const k = (x) => x.opponent + '|' + x.map + '|' + x.side; const B = new Map(r.filter((x) => x.variant === 'base').map((x) => [k(x), x]));
const STALL = ['00lanes', '00rushbait-v2', '01yellow-brick-road'], REG = ['00reverse-spiral', '00stampede', '00swirl', '01boss-battle', '01islands', '01starfish'];
const grp = (m) => (STALL.includes(m) ? 'stall' : REG.includes(m) ? 'regression' : 'other'); const S = {};
for (const x of r.filter((x) => x.variant === variant)) { const b = B.get(k(x)); for (const key of ['map:' + grp(x.map), 'opp:' + x.opponent]) { const o = (S[key] ||= { g: 0, l: 0 }); if (x.win && !b.win) o.g++; if (!x.win && b.win) o.l++; } }
console.log(`strata (${variant} vs base): ` + Object.entries(S).map(([s, o]) => `${s} +${o.g}/-${o.l} (net ${o.g - o.l})`).join(', '));
