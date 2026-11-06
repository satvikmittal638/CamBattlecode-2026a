#!/usr/bin/env node
// Fix the autoresearch plans once, before any candidate runs:
//  1. weak/strong map split from v121-v129 platform history (autoresearch/history/groups),
//  2. local plan: 48 (map, opponent) pairs x 2 sides = 96 games, 70/30 weak/strong, opponents = last 10 versions,
//  3. online screen plan: 6 challenges x 5 maps = 30 games, 3 near our rank + 3 near rank/2, 70/30 weak/strong,
//     sides balanced. Opponents are pinned later via sourceGroupId = the baseline arm's group.
// Reads only (ladder, challenge options). Writes autoresearch/{map_split,local_plan,online_plan}.json.
import fs from 'node:fs';
import { api } from '../tools/bclib.mjs';
const H = 'autoresearch/history/groups';
const OPP = ['arop-v123', 'arop-v125', 'arop-v126', 'arop-v127', 'arop-v128', 'arop-v129', 'arop-v130', 'arop-v131', 'arop-v132', 'arop-v133'];
const recs = fs.readdirSync(H).map((f) => JSON.parse(fs.readFileSync(`${H}/${f}`))).filter((g) => g.version >= 121 && g.version <= 129);
const per = {};
for (const g of recs) for (const m of g.matches) {
  if (!m.result || (m.result !== 'win' && m.result !== 'loss')) continue;
  const p = (per[m.map] ??= { w: 0, n: 0 }); p.n++; p.w += m.result === 'win';
}
const opts = await api('GET', '/challenges');
const pool = opts.maps.map((m) => m.name);
const local = new Set(fs.readdirSync('workspace/maps').filter((f) => f.endsWith('.map26a')).map((f) => f.replace('.map26a', '')));
const localName = (m) => [m, m.replaceAll('_', '-')].find((x) => local.has(x));
const rows = pool.filter((m) => per[m]?.n >= 5 && localName(m)).map((m) => ({ map: m, local: localName(m), n: per[m].n, wr: per[m].w / per[m].n }));
rows.sort((a, b) => a.wr - b.wr || b.n - a.n);
const weak = rows.filter((r) => r.wr < 0.4), strong = rows.filter((r) => r.wr >= 0.6).sort((a, b) => b.wr - a.wr || b.n - a.n);
fs.writeFileSync('autoresearch/map_split.json', JSON.stringify({ source: `v121-v129, ${recs.length} groups`, threshold: 'weak wr<0.40, strong wr>=0.60, n>=5', weak, strong, middle: rows.filter((r) => r.wr >= 0.4 && r.wr < 0.6), unclassified: pool.filter((m) => !rows.find((r) => r.map === m)) }, null, 1));
console.log(`groups ${recs.length}; maps classified ${rows.length}; weak ${weak.length}; strong ${strong.length}`);
console.log('weak:', weak.map((r) => `${r.map}(${Math.round(100 * r.wr)}%/${r.n})`).join(' '));
console.log('strong:', strong.map((r) => `${r.map}(${Math.round(100 * r.wr)}%/${r.n})`).join(' '));

// Local plan: weak maps take 34 pairs, strong 14, each map up to 2 opponents, opponents rotate evenly.
const pick = (list, pairs) => { const out = []; let k = 0; while (out.length < pairs) { const r = list[k % list.length]; if (out.filter((x) => x.map === r.local).length < 3) out.push({ map: r.local, api: r.map }); k++; if (k > 500) break; } return out; };
const wl = pick(weak.slice(0, 17), 34), sl = pick(strong.slice(0, 7), 14);
let oi = 0; const pairs = [];
for (const [cls, list] of [['weak', wl], ['strong', sl]]) for (const e of list) pairs.push({ map: e.map, api: e.api, cls, opp: OPP[oi++ % OPP.length] });
fs.writeFileSync('autoresearch/local_plan.json', JSON.stringify({ games: pairs.length * 2, opponents: OPP, pairs }, null, 1));
console.log(`local plan: ${pairs.length} pairs, ${new Set(pairs.map((p) => p.map)).size} maps`);

// Online screen: 3 near rank + 3 half rank, 21 weak + 9 strong games.
const rank = opts.requesterRank, ourId = opts.team?.id;
let teams = [];
for (let page = 1; page <= 4; page++) { const l = await api('GET', `/ladder?page=${page}&pageSize=100&category=all`); if (!l.teams?.length) break; teams.push(...l.teams); }
const eligible = teams.filter((t) => t.hasBot !== false && t.teamId !== ourId && t.name !== 'Agentic Loop Builders');
const closest = (c, n, skip) => eligible.filter((t) => !skip.has(t.teamId)).sort((a, b) => Math.abs(a.rank - c) - Math.abs(b.rank - c) || a.rank - b.rank).slice(0, n);
const used = new Set();
const near = closest(rank, 3, used); near.forEach((t) => used.add(t.teamId));
const half = closest(rank / 2, 3, used); half.forEach((t) => used.add(t.teamId));
const wq = weak.map((r) => r.map), sq = strong.map((r) => r.map);
let wi = 0, si = 0; const specs = [];
[...near.map((t) => ['near', t]), ...half.map((t) => ['half', t])].forEach(([poolName, t], i) => {
  const nStrong = i < 3 ? (i === 0 ? 2 : 1) : (i === 3 ? 2 : (i === 4 ? 2 : 1));
  const maps = [];
  for (let j = 0; j < 5 - nStrong; j++) maps.push(wq[wi++ % wq.length]);
  for (let j = 0; j < nStrong; j++) maps.push(sq[si++ % sq.length]);
  const sides = maps.map((_, j) => ((i + j) % 2 ? 'b' : 'a'));
  specs.push({ label: `${poolName}_r${t.rank}_${i + 1}`, pool: poolName, rank: t.rank, teamId: t.teamId, opponent: t.name, maps, sides, cls: maps.map((m) => (sq.includes(m) ? 'strong' : 'weak')) });
});
const total = specs.flatMap((s) => s.cls);
fs.writeFileSync('autoresearch/online_plan.json', JSON.stringify({ rank, specs }, null, 1));
console.log(`online plan: rank ${rank}; ${specs.length} challenges; weak ${total.filter((c) => c === 'weak').length} strong ${total.filter((c) => c === 'strong').length}; sides a ${specs.flatMap((s) => s.sides).filter((x) => x === 'a').length}`);
for (const s of specs) console.log(' ', s.label, s.opponent, s.maps.join(','), s.sides.join(''));
