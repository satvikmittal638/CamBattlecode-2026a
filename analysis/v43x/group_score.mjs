// Challenge (match-group) results of a platform run: a challenge is won with 3+ of its 5 games.
// Pools by label prefix (near_*, half_*). Also game totals.   node analysis/v43x/group_score.mjs <index.json> [challenges.txt]
import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const g = {}; for (const x of idx) { const k = x.groupId; g[k] = g[k] || { label: x.label, w: 0, n: 0 }; g[k].n++; if (x.result === 'win') g[k].w++; }
const pools = {}; for (const v of Object.values(g)) { const p = v.label.split('_')[0]; const s = pools[p] = pools[p] || { groups: 0, won: 0, incomplete: 0, gw: 0, gn: 0 }; s.groups++; s.gw += v.w; s.gn += v.n; if (v.n < 5) s.incomplete++; if (v.w >= 3) s.won++; }
for (const [p, s] of Object.entries(pools)) console.log(`${p}: challenges won ${s.won}/${s.groups}${s.incomplete ? ` (${s.incomplete} with <5 games collected)` : ''}; games ${s.gw}/${s.gn}`);
if (process.argv[3]) { const sent = fs.readFileSync(process.argv[3], 'utf8').trim().split('\n').filter((l) => /[0-9a-f-]{36}$/.test(l)).length; console.log(`challenges sent: ${sent}; collected groups: ${Object.keys(g).length}`); }
